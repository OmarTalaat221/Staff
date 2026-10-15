<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "../../db_con.php";

$json = file_get_contents('php://input');
$obj = json_decode($json, true) ?? [];

$employee_id = (int)($_GET['employee_id'] ?? $obj['employee_id'] ?? 0);
$rota_id = (int)($_GET['rota_id'] ?? $obj['rota_id'] ?? 0);

if ($employee_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Valid employee_id is required."
    ]);
    exit();
}

$response = new stdClass();

try {
    // 1. Get Employee info
    $emp_query = mysqli_query($con, "SELECT full_name, role, department FROM employees WHERE employee_id = '$employee_id'");
    if (mysqli_num_rows($emp_query) === 0) {
        throw new Exception("Employee not found.");
    }
    $employee = mysqli_fetch_assoc($emp_query);

    // 2. Get Rota Info
    $rota_name = "Independent Shifts";
    if ($rota_id > 0) {
        $rota_query = mysqli_query($con, "SELECT name FROM rota_templates WHERE id = '$rota_id'");
        if ($rota_row = mysqli_fetch_assoc($rota_query)) {
            $rota_name = $rota_row['name'];
        }
    }

    // 3. Get Salary Info from rota_employees
    $salary_amount = 0;
    $salary_type = 'Monthly';
    if ($rota_id > 0) {
        $salary_query = mysqli_query($con, "SELECT salary_amount, salary_type FROM rota_employees WHERE rota_id = '$rota_id' AND employee_id = '$employee_id'");
        if ($salary_row = mysqli_fetch_assoc($salary_query)) {
            $salary_amount = (float)$salary_row['salary_amount'];
            $salary_type = $salary_row['salary_type'];
        }
    }

    // 4. Fetch Shifts and Attendance
    $where_rota = $rota_id > 0 ? "s.rota_id = '$rota_id'" : "s.rota_id IS NULL";

    $query = "
        SELECT 
            s.*,
            a.attendance_id, a.check_in_time, a.check_out_time, 
            a.late_arrival_minutes, a.late_departure_minutes
        FROM shifts s
        LEFT JOIN attendance a ON s.shift_id = a.shift_id
        WHERE s.employee_id = '$employee_id' AND $where_rota
        ORDER BY s.shift_date ASC, s.start_time ASC
    ";

    $sql = mysqli_query($con, $query);
    if (!$sql) {
        throw new Exception("Database query failed: " . mysqli_error($con));
    }

    $shifts = [];
    $total_stats = [
        "late_arrival" => 0,
        "early_arrival" => 0,
        "overtime" => 0,
        "early_departure" => 0,
        "balance" => 0
    ];
    $total_planned_cost = 0;
    $total_actual_cost = 0;

    $today = date("Y-m-d");

    // Helper to format minutes
    $format_minutes = function ($minutes) {
        $is_negative = $minutes < 0;
        $abs_min = abs($minutes);
        $hours = floor($abs_min / 60);
        $mins = $abs_min % 60;
        $sign = $is_negative ? "-" : "";
        if ($hours > 0 && $mins > 0) return "{$sign}{$hours}h {$mins}m";
        if ($hours > 0) return "{$sign}{$hours}h";
        if ($mins > 0) return "{$sign}{$mins}m";
        return "0m";
    };

    while ($row = mysqli_fetch_assoc($sql)) {
        $shift_date = $row['shift_date'];

        // A. Calculate Shift Timings & Planned Time
        $sTime = new DateTime($row['shift_date'] . ' ' . $row['start_time']);
        $eTime = clone $sTime;
        $eTimeArray = explode(':', $row['end_time']);
        $eTime->setTime($eTimeArray[0], $eTimeArray[1], $eTimeArray[2] ?? 0);
        if ($eTime < $sTime) {
            $eTime->modify('+1 day');
        }
        $planned_minutes = ($sTime->diff($eTime)->h * 60) + $sTime->diff($eTime)->i;

        if (!empty($row['break_start']) && !empty($row['break_end']) && $row['break_start'] !== '00:00:00') {
            $bStart = new DateTime($row['shift_date'] . ' ' . $row['break_start']);
            $bEnd = clone $bStart;
            $bEndArray = explode(':', $row['break_end']);
            $bEnd->setTime($bEndArray[0], $bEndArray[1], $bEndArray[2] ?? 0);
            if ($bEnd < $bStart) $bEnd->modify('+1 day');
            $break_minutes = ($bStart->diff($bEnd)->h * 60) + $bStart->diff($bEnd)->i;
            $planned_minutes -= $break_minutes;
        }

        // B. Calculate Actual Time
        $worked_minutes = 0;
        if (!empty($row['check_in_time']) && !empty($row['check_out_time'])) {
            $cIn = new DateTime($row['check_in_time']);
            $cOut = new DateTime($row['check_out_time']);
            $worked_minutes = ($cIn->diff($cOut)->h * 60) + $cIn->diff($cOut)->i;
        }

        // C. Calculate Shift Cost
        $planned_cost = 0;
        $actual_cost = 0;

        if ($salary_type == 'Hourly') {
            $planned_cost = ($planned_minutes / 60) * $salary_amount;
            $actual_cost = ($worked_minutes / 60) * $salary_amount;
        } else {
            // Monthly
            $days_in_month = cal_days_in_month(CAL_GREGORIAN, date('m', strtotime($shift_date)), date('Y', strtotime($shift_date)));
            $daily_rate = $salary_amount / $days_in_month;
            $planned_cost = $daily_rate;
            // If they attended, give daily rate. (In a real system, there might be deductions for late)
            if (!empty($row['attendance_id'])) {
                $actual_cost = $daily_rate;
            }
        }

        $total_planned_cost += $planned_cost;
        $total_actual_cost += $actual_cost;

        // D. Calculate Stats
        $late_arr = 0;
        $early_arr = 0;
        $overtime = 0;
        $early_dep = 0;

        if ($shift_date <= $today && !empty($row['attendance_id'])) {
            $late_arr = (int)$row['late_arrival_minutes'];

            $cIn = new DateTime($row['check_in_time']);
            if ($cIn < $sTime) {
                $early_arr = ($cIn->diff($sTime)->h * 60) + $cIn->diff($sTime)->i;
            }

            $late_dep_val = (int)$row['late_departure_minutes'];
            if ($late_dep_val > 0) {
                $overtime = $late_dep_val;
            } else if ($late_dep_val < 0) {
                $early_dep = abs($late_dep_val);
            }

            $total_stats['late_arrival'] += $late_arr;
            $total_stats['early_arrival'] += $early_arr;
            $total_stats['overtime'] += $overtime;
            $total_stats['early_departure'] += $early_dep;
        }

        $balance = ($early_arr + $overtime) - ($late_arr + $early_dep);
        $total_stats['balance'] += $balance;

        $status = "Upcoming";
        if (!empty($row['attendance_id'])) {
            $status = "Attended";
        } else if ($shift_date < $today) {
            $status = "Absent";
        }

        $shifts[] = [
            "shift_id" => $row['shift_id'],
            "date" => $shift_date,
            "shift_type" => $row['shift_type'],
            "schedule" => [
                "start_time" => substr($row['start_time'], 0, 5),
                "end_time" => substr($row['end_time'], 0, 5),
                "planned_hours" => round($planned_minutes / 60, 2)
            ],
            "attendance" => [
                "status" => $status,
                "check_in" => !empty($row['check_in_time']) ? substr($row['check_in_time'], 11, 5) : null,
                "check_out" => !empty($row['check_out_time']) ? substr($row['check_out_time'], 11, 5) : null,
                "worked_hours" => round($worked_minutes / 60, 2)
            ],
            "costs" => [
                "planned_cost" => round($planned_cost, 2),
                "actual_cost" => round($actual_cost, 2),
                "currency" => "£"
            ],
            "stats" => [
                "late_arrival_mins" => $late_arr,
                "early_arrival_mins" => $early_arr,
                "overtime_mins" => $overtime,
                "early_departure_mins" => $early_dep,
                "balance_mins" => $balance,
                "balance_formatted" => $format_minutes($balance)
            ]
        ];
    }

    echo json_encode([
        "success" => true,
        "employee" => $employee,
        "rota" => [
            "rota_id" => $rota_id > 0 ? $rota_id : null,
            "rota_name" => $rota_name,
            "salary_type" => $salary_type,
            "salary_amount" => $salary_amount
        ],
        "summary" => [
            "total_planned_cost" => round($total_planned_cost, 2),
            "total_actual_cost" => round($total_actual_cost, 2),
            "stats_minutes" => $total_stats,
            "stats_formatted" => [
                "late_arrival" => $format_minutes($total_stats['late_arrival']),
                "early_arrival" => $format_minutes($total_stats['early_arrival']),
                "overtime" => $format_minutes($total_stats['overtime']),
                "early_departure" => $format_minutes($total_stats['early_departure']),
                "balance" => $format_minutes($total_stats['balance'])
            ]
        ],
        "shifts" => $shifts
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}

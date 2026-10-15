<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];
$month = $obj['month'] ?? date("m");
$year = $obj['year'] ?? date("Y");

$response = new stdClass();

if (!$employee_id) {
    $response->status = "error";
    $response->message = 'Employee ID is required.';
    echo json_encode($response);
    exit;
}

// Fetch all shifts for the employee in the specified month
$query = "SELECT s.*, a.attendance_id, a.check_in_time, a.check_out_time, a.late_arrival_minutes, a.late_departure_minutes, 
                 re.salary_amount as assigned_salary, re.salary_type as assigned_salary_type 
          FROM `shifts` s 
          LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND a.employee_id = s.employee_id
          LEFT JOIN `rota_employees` re ON s.rota_id = re.rota_id AND s.employee_id = re.employee_id
          WHERE s.employee_id = '$employee_id' 
          AND MONTH(s.shift_date) = '$month' 
          AND YEAR(s.shift_date) = '$year' 
          ORDER BY s.shift_date ASC";

$sql = mysqli_query($con, $query);

// Fetch employee salary info
$emp_query = mysqli_query($con, "SELECT salary, salary_type FROM employees WHERE employee_id = '$employee_id'");
$emp_info = mysqli_fetch_assoc($emp_query);
$base_salary = (float)$emp_info['salary'];
$salary_type = $emp_info['salary_type'];

if ($sql) {
    $db_shifts = array();
    while ($row = mysqli_fetch_assoc($sql)) {
        $date = $row['shift_date'];
        if (!isset($db_shifts[$date])) {
            $db_shifts[$date] = array();
        }
        $db_shifts[$date][] = $row;
    }

    $shifts = array();
    $total_shifts = 0;
    $attended_shifts = 0;
    $total_late_minutes = 0;
    $total_working_minutes = 0;
    $total_planned_minutes = 0;
    $days_with_shifts = array();

    $calculatedSalary = 0;
    $latest_salary_amount = $base_salary;
    $latest_salary_type = $salary_type;

    $num_days = cal_days_in_month(CAL_GREGORIAN, (int)$month, (int)$year);
    $today = date("Y-m-d");

    for ($i = 1; $i <= $num_days; $i++) {
        $current_date = sprintf('%04d-%02d-%02d', $year, $month, $i);

        if (isset($db_shifts[$current_date])) {
            foreach ($db_shifts[$current_date] as $row) {
                $shift = new stdClass();
                $shift->shift_id = $row['shift_id'];
                $shift->date = $row['shift_date'];
                $shift->start = substr($row['start_time'], 0, 5);
                $shift->end = substr($row['end_time'], 0, 5);
                $shift->breakStart = $row['break_start'] ? substr($row['break_start'], 0, 5) : "";
                $shift->breakEnd = $row['break_end'] ? substr($row['break_end'], 0, 5) : "";
                $shift->note = $row['notes'];

                $days_with_shifts[$row['shift_date']] = true;

                $shift_salary_amount = isset($row['assigned_salary']) ? $row['assigned_salary'] : $base_salary;
                $shift_salary_type = isset($row['assigned_salary_type']) ? $row['assigned_salary_type'] : $salary_type;

                $latest_salary_amount = $shift_salary_amount;
                $latest_salary_type = $shift_salary_type;

                // Calculate Planned Minutes
                $sTime = new DateTime($row['shift_date'] . ' ' . $row['start_time']);
                $eTime = new DateTime($row['shift_date'] . ' ' . $row['end_time']);
                $diffT = $sTime->diff($eTime);
                $total_planned_minutes += ($diffT->h * 60) + $diffT->i;

                $shift->attendance = new stdClass();
                $shift->attendance->id = $row['attendance_id'] ?? null; 
                $shift->attendance->check_in = $row['check_in_time'] ? substr($row['check_in_time'], 11, 5) : null;
                $shift->attendance->check_out = $row['check_out_time'] ? substr($row['check_out_time'], 11, 5) : null;
                $shift->attendance->late_arrival = $row['late_arrival_minutes'] ?? 0;
                $shift->attendance->late_departure = $row['late_departure_minutes'] ?? 0;

                // Determine status
                if ($row['attendance_id']) {
                    $shift->status = "Attended";
                    $shift->DayStatus = "present";
                } elseif ($row['shift_date'] < $today) {
                    $shift->status = "Absent";
                    $shift->DayStatus = "absent";
                } elseif ($row['shift_date'] == $today) {
                    $shift->status = "Today";
                    $shift->DayStatus = "absent";
                } else {
                    $shift->status = "Upcoming";
                    $shift->DayStatus = "absent";
                }

                $total_shifts++;
                $shift_working_minutes = 0;

                if ($row['attendance_id']) {
                    $attended_shifts++;
                    $total_late_minutes += ($row['late_arrival_minutes'] ?? 0) + ($row['late_departure_minutes'] ?? 0);

                    if ($row['check_in_time'] && $row['check_out_time']) {
                        $check_in = new DateTime($row['check_in_time']);
                        $check_out = new DateTime($row['check_out_time']);
                        $interval = $check_in->diff($check_out);
                        $shift_working_minutes = ($interval->h * 60) + $interval->i;
                        $total_working_minutes += $shift_working_minutes;
                    }
                }

                // Calculate Financials incrementally for Hourly
                if ($shift_salary_type == 'Hourly' && $shift_working_minutes > 0) {
                    $calculatedSalary += ($shift_working_minutes / 60) * $shift_salary_amount;
                }

                $shifts[] = $shift;
            }
        } else {
            // Holiday day (No shifts found for this date)
            $shift = new stdClass();
            $shift->shift_id = null;
            $shift->date = $current_date;
            $shift->start = null;
            $shift->end = null;
            $shift->breakStart = "";
            $shift->breakEnd = "";
            $shift->note = "";

            $shift->attendance = new stdClass();
            $shift->attendance->id = null;
            $shift->attendance->check_in = null;
            $shift->attendance->check_out = null;
            $shift->attendance->late_arrival = 0;
            $shift->attendance->late_departure = 0;

            if ($current_date < $today) {
                $shift->status = "Holiday (Passed)";
            } elseif ($current_date == $today) {
                $shift->status = "Holiday (Today)";
            } else {
                $shift->status = "Holiday";
            }

            $shift->DayStatus = "holiday";

            $shifts[] = $shift;
        }
    }

    $summary = new stdClass();
    $summary->total_shifts = $total_shifts;
    $summary->attended_shifts = $attended_shifts;
    $summary->absent_shifts = $total_shifts - $attended_shifts;
    $summary->total_late_minutes = $total_late_minutes;
    $summary->total_working_hours = round($total_working_minutes / 60, 2);

    // Calculate offDays
    $numDays = cal_days_in_month(CAL_GREGORIAN, (int)$month, (int)$year);
    $summary->offDays = $numDays - count($days_with_shifts);

    // Calculate Balance (H:M)
    $balanceMinutes = $total_working_minutes - $total_planned_minutes;
    $sign = $balanceMinutes >= 0 ? "+" : "-";
    $absMin = abs($balanceMinutes);
    $h = floor($absMin / 60);
    $m = $absMin % 60;
    $summary->hours_balance = sprintf("%s%02d:%02d", $sign, $h, $m);

    // For Monthly salary, just use the latest salary amount as the calculated salary
    if ($latest_salary_type != 'Hourly') {
        $calculatedSalary = $latest_salary_amount;
    }

    $summary->salary_info = [
        "salary_value" => $latest_salary_amount,
        "salary_type" => $latest_salary_type,
        "calculated_salary" => round($calculatedSalary, 2)
    ];

    $response->status = "success";
    $response->summary = $summary;
    $response->data = $shifts;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching the month schedule.";
}

echo json_encode($response);

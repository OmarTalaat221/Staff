<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'] ?? null;

$response = new stdClass();

if (!$employee_id) {
    $response->status = "error";
    $response->message = 'Employee ID is required.';
    echo json_encode($response);
    exit;
}

$center_time = strtotime(date("Y-m-01"));

$prev_month_time = strtotime("-1 month", $center_time);
$curr_month_time = $center_time;
$next_month_time = strtotime("+1 month", $center_time);

$start_date = date("Y-m-01", $prev_month_time);
$end_date = date("Y-m-t", $next_month_time);

// Fetch all shifts for the employee in the 3-month range
$query = "SELECT s.*, a.attendance_id, a.check_in_time, a.check_out_time, a.late_arrival_minutes, a.late_departure_minutes,
                 re.salary_amount as assigned_salary, re.salary_type as assigned_salary_type 
          FROM `shifts` s 
          LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND a.employee_id = s.employee_id
          LEFT JOIN `rota_employees` re ON s.rota_id = re.rota_id AND s.employee_id = re.employee_id
          WHERE s.employee_id = '$employee_id' 
          AND s.shift_date >= '$start_date' 
          AND s.shift_date <= '$end_date' 
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

    $calculatedSalary = 0;
    $latest_salary_amount = $base_salary;
    $latest_salary_type = $salary_type;

    $today = date("Y-m-d");
    $months_to_loop = [
        $prev_month_time,
        $curr_month_time,
        $next_month_time
    ];

    foreach ($months_to_loop as $m_time) {
        $m_month = date("m", $m_time);
        $m_year = date("Y", $m_time);
        $num_days = cal_days_in_month(CAL_GREGORIAN, (int)$m_month, (int)$m_year);

        for ($i = 1; $i <= $num_days; $i++) {
            $current_date = sprintf('%04d-%02d-%02d', $m_year, $m_month, $i);

            if (isset($db_shifts[$current_date])) {
                foreach ($db_shifts[$current_date] as $row) {
                    $shift = new stdClass();
                    $shift->shift_id = $row['shift_id'];
                    $shift->date = $row['shift_date'];
                    $shift->shift_type = $row['shift_type'] ? $row['shift_type'] : "Work";

                    $shift->start = substr($row['start_time'], 0, 5);
                    $shift->end = substr($row['end_time'], 0, 5);
                    $shift->breakStart = $row['break_start'] ? substr($row['break_start'], 0, 5) : "";
                    $shift->breakEnd = $row['break_end'] ? substr($row['break_end'], 0, 5) : "";
                    $shift->note = $row['notes'];

                    $shift_salary_amount = isset($row['assigned_salary']) ? $row['assigned_salary'] : $base_salary;
                    $shift_salary_type = isset($row['assigned_salary_type']) ? $row['assigned_salary_type'] : $salary_type;

                    $latest_salary_amount = $shift_salary_amount;
                    $latest_salary_type = $shift_salary_type;

                    $shift->attendance = new stdClass();
                    $shift->attendance->id = $row['attendance_id'] ?? null;
                    $shift->attendance->check_in = $row['check_in_time'] ? substr($row['check_in_time'], 11, 5) : null;
                    $shift->attendance->check_out = $row['check_out_time'] ? substr($row['check_out_time'], 11, 5) : null;
                    $shift->attendance->late_arrival = $row['late_arrival_minutes'] ?? 0;
                    $shift->attendance->late_departure = $row['late_departure_minutes'] ?? 0;

                    // Determine status
                    if ($row['attendance_id']) {
                        $shift->status = "Attended";
                    } elseif ($row['shift_date'] < $today) {
                        $shift->status = "Absent";
                    } elseif ($row['shift_date'] == $today) {
                        $shift->status = "Today";
                    } else {
                        $shift->status = "Upcoming";
                    }

                    $shift->is_past = ($current_date < $today);
                    $shift->day_status = ($current_date < $today) ? "passed" : (($current_date == $today) ? "today" : "upcoming");

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
                $shift->shift_type = "Holiday";
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

                $shift->is_past = ($current_date < $today);
                $shift->day_status = ($current_date < $today) ? "passed" : (($current_date == $today) ? "today" : "upcoming");

                $shifts[] = $shift;
            }
        }
    }

    $summary = new stdClass();
    $summary->total_shifts = $total_shifts;
    $summary->attended_shifts = $attended_shifts;
    $summary->absent_shifts = $total_shifts - $attended_shifts;
    $summary->total_late_minutes = $total_late_minutes;
    $summary->total_working_hours = round($total_working_minutes / 60, 2);

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

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$rota_id = $obj['rota_id'];
$response = new stdClass();

if ($rota_id) {
    // 1. Fetch Basic Rota Info
    $rota_query = mysqli_query($con, "SELECT * FROM `rota_templates` WHERE `id` = '$rota_id'");
    $rota_info = mysqli_fetch_assoc($rota_query);

    if ($rota_info) {
        // 2. Fetch all employees assigned to this rota first
        $emp_query = "SELECT re.*, e.full_name 
                      FROM `rota_employees` re 
                      JOIN `employees` e ON re.employee_id = e.employee_id 
                      WHERE re.rota_id = '$rota_id' 
                      ORDER BY e.full_name";
        $emp_sql = mysqli_query($con, $emp_query);
        $data = array();

        if ($emp_sql) {
            while ($emp = mysqli_fetch_assoc($emp_sql)) {
                $emp_id = $emp['employee_id'];
                $data[$emp_id] = [
                    "employee_id" => $emp_id,
                    "full_name" => $emp['full_name'],
                    "salary_info" => [
                        "id" => $emp['id'],
                        "salary_amount" => (float)$emp['salary_amount'],
                        "salary_type" => $emp['salary_type']
                    ],
                    "total_shifts" => 0,
                    "shifts" => []
                ];
            }
        }

        // 3. Fetch shifts for this rota
        $query = "SELECT * FROM `shifts` WHERE `rota_id` = '$rota_id' ORDER BY `shift_date` ASC";
        $sql = mysqli_query($con, $query);

        if ($sql) {
            while ($row = mysqli_fetch_assoc($sql)) {
                $emp_id = $row['employee_id'];
                
                // If a shift exists for an employee not in rota_employees, skip (or handle)
                if (!isset($data[$emp_id])) {
                    continue;
                }
                
                $salary_amount = $data[$emp_id]['salary_info']['salary_amount'];
                $salary_type = $data[$emp_id]['salary_info']['salary_type'];
                
                // Calculate Planned Minutes
                $sTime = new DateTime($row['shift_date'] . ' ' . $row['start_time']);
                $eTime = clone $sTime;
                $eTimeArray = explode(':', $row['end_time']);
                $eTime->setTime($eTimeArray[0], $eTimeArray[1], $eTimeArray[2] ?? 0);
                if ($eTime < $sTime) {
                    $eTime->modify('+1 day');
                }
                $diffT = $sTime->diff($eTime);
                $planned_minutes = ($diffT->h * 60) + $diffT->i;

                // Subtract Break
                if ($row['break_start'] && $row['break_end']) {
                    $bStart = new DateTime($row['shift_date'] . ' ' . $row['break_start']);
                    $bEnd = clone $bStart;
                    $bEndArray = explode(':', $row['break_end']);
                    $bEnd->setTime($bEndArray[0], $bEndArray[1], $bEndArray[2] ?? 0);
                    if ($bEnd < $bStart) {
                        $bEnd->modify('+1 day');
                    }
                    $breakDiff = $bStart->diff($bEnd);
                    $break_minutes = ($breakDiff->h * 60) + $breakDiff->i;
                    $planned_minutes -= $break_minutes;
                }
                
                // Calculate Shift Cost
                $shift_cost = 0;
                
                if ($salary_type == 'Hourly') {
                    $shift_cost = ($planned_minutes / 60) * $salary_amount;
                } else {
                    // For Monthly, calculate daily rate based on days in the month
                    $days_in_month = cal_days_in_month(CAL_GREGORIAN, date('m', strtotime($row['shift_date'])), date('Y', strtotime($row['shift_date'])));
                    $shift_cost = $salary_amount / $days_in_month;
                }

                $data[$emp_id]["shifts"][] = [
                    "shift_id" => $row['shift_id'],
                    "shift_date" => $row['shift_date'],
                    "day_number" => date('d', strtotime($row['shift_date'])),
                    "shift_type" => $row['shift_type'],
                    "start_time" => $row['start_time'],
                    "end_time" => $row['end_time'],
                    "break_start" => $row['break_start'],
                    "break_end" => $row['break_end'],
                    "notes" => $row['notes'],
                    "planned_hours" => round($planned_minutes / 60, 2),
                    "shift_cost" => round($shift_cost, 2)
                ];
                
                // Update Employee Summary
                $data[$emp_id]['total_shifts']++;
            }

            $response->status = "success";
            $response->rota_name = $rota_info['name'];
            $response->data = array_values($data);
        } else {
            $response->status = "error";
            $response->message = "An error occurred while fetching details.";
        }
    } else {
        $response->status = "error";
        $response->message = "Rota template not found.";
    }
} else {
    $response->status = "error";
    $response->message = "Rota ID is required.";
}

echo json_encode($response);
?>

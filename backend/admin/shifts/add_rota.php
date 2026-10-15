<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$template_name = $obj['template_name'] ?? ('Rota ' . date("Y-m-d H:i"));
$month = (int)($obj['month'] ?? date("m"));
$year = (int)($obj['year'] ?? date("Y"));
$data = $obj['data']; // Expected: array of { employee_id, shifts: [...] }

$response = new stdClass();

if (is_array($data)) {
    mysqli_begin_transaction($con);

    try {
        // 1. Create Template Record
        $stmt = $con->prepare("INSERT INTO `rota_templates` (`name`) VALUES (?)");
        $stmt->bind_param("s", $template_name);
        $stmt->execute();
        $rota_id = $con->insert_id;

        $shifts_added = 0;
        $template_items_added = 0;
        $num_days_in_month = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        foreach ($data as $emp) {
            $employee_id = $emp['employee_id'];
            
            // Fetch employee's current salary to lock it in for this rota
            $emp_query = mysqli_query($con, "SELECT salary, salary_type FROM employees WHERE employee_id = '$employee_id'");
            $emp_info = mysqli_fetch_assoc($emp_query);
            $salary_amount = $emp_info ? $emp_info['salary'] : 0.00;
            $salary_type = $emp_info ? $emp_info['salary_type'] : 'Monthly';

            // Insert into rota_employees to assign salary for this specific rota
            $sql_rota_emp = "INSERT INTO `rota_employees` (`rota_id`, `employee_id`, `salary_amount`, `salary_type`) 
                             VALUES ('$rota_id', '$employee_id', '$salary_amount', '$salary_type')
                             ON DUPLICATE KEY UPDATE `salary_amount` = '$salary_amount', `salary_type` = '$salary_type'";
            mysqli_query($con, $sql_rota_emp);

            $shifts = $emp['shifts'];

            if (is_array($shifts)) {
                foreach ($shifts as $shift) {
                    $day = (int)$shift['day_number'];
                    $shift_type = $shift['shift_type'] ?? '';
                    $start_time = $shift['start_time'];
                    $end_time = $shift['end_time'];
                    $break_start = $shift['break_start'] ?? null;
                    $break_end = $shift['break_end'] ?? null;
                    $notes = $shift['notes'] ?? '';

                    // Save to Actual Shifts directly, mapping to rota_id (without redundant salary logic)
                    if ($day <= $num_days_in_month) {
                        $shift_date = sprintf('%04d-%02d-%02d', $year, $month, $day);
                        $sql_shift = "INSERT INTO `shifts` (`employee_id`, `rota_id`, `shift_date`, `shift_type`, `start_time`, `end_time`, `break_start`, `break_end`, `notes`) 
                                      VALUES ('$employee_id', '$rota_id', '$shift_date', '$shift_type', '$start_time', '$end_time', " . 
                                      ($break_start ? "'$break_start'" : "NULL") . ", " . 
                                      ($break_end ? "'$break_end'" : "NULL") . ", '$notes')";
                        mysqli_query($con, $sql_shift);
                        $shifts_added++;
                    }
                }
            }
        }

        mysqli_commit($con);
        $response->status = "success";
        $response->message = "Rota published and saved as template '$template_name'. ($shifts_added shifts created)";
        $response->rota_id = $rota_id;

    } catch (Exception $e) {
        mysqli_rollback($con);
        $response->status = "error";
        $response->message = "Transaction failed: " . $e->getMessage();
    }
} else {
    $response->status = "error";
    $response->message = 'Invalid data provided.';
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$old_rota_id = $obj['rota_id'];
$month = (int)$obj['month'];
$year = (int)$obj['year'];
$new_rota_name = $obj['new_rota_name'] ?? ("Applied Rota " . date("Y-m-d H:i"));

$response = new stdClass();

if ($old_rota_id && $month && $year) {
    mysqli_begin_transaction($con);

    try {
        // 1. Create a NEW Template Record for History
        $stmt = $con->prepare("INSERT INTO `rota_templates` (`name`) VALUES (?)");
        $stmt->bind_param("s", $new_rota_name);
        $stmt->execute();
        $new_rota_id = $con->insert_id;

        // 2. Get Old Shifts from previous rota
        $sql_items = mysqli_query($con, "SELECT * FROM `shifts` WHERE `rota_id` = '$old_rota_id'");
        
        $success_count = 0;
        $num_days_in_month = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        
        // Keep track of employees processed for this new rota
        $processed_employees = array();

        while ($item = mysqli_fetch_assoc($sql_items)) {
            // Get the day number from the old shift date
            $day = (int)date('d', strtotime($item['shift_date']));
            $employee_id = $item['employee_id'];
            $shift_type = $item['shift_type'];
            $start_time = $item['start_time'];
            $end_time = $item['end_time'];
            $break_start = $item['break_start'];
            $break_end = $item['break_end'];
            $notes = $item['notes'];

            // Fetch current salary for the new shifts
            $emp_query = mysqli_query($con, "SELECT salary, salary_type FROM employees WHERE employee_id = '$employee_id'");
            $emp_info = mysqli_fetch_assoc($emp_query);
            $salary_amount = $emp_info ? $emp_info['salary'] : 0.00;
            $salary_type = $emp_info ? $emp_info['salary_type'] : 'Monthly';

            // Insert into rota_employees ONCE per employee
            if (!isset($processed_employees[$employee_id])) {
                $sql_rota_emp = "INSERT INTO `rota_employees` (`rota_id`, `employee_id`, `salary_amount`, `salary_type`) 
                                 VALUES ('$new_rota_id', '$employee_id', '$salary_amount', '$salary_type')
                                 ON DUPLICATE KEY UPDATE `salary_amount` = '$salary_amount', `salary_type` = '$salary_type'";
                mysqli_query($con, $sql_rota_emp);
                $processed_employees[$employee_id] = true;
            }

            // B. Apply to Actual Shifts in new month (if day exists)
            if ($day <= $num_days_in_month) {
                $shift_date = sprintf('%04d-%02d-%02d', $year, $month, $day);
                $sql_insert = "INSERT INTO `shifts` (`employee_id`, `rota_id`, `shift_date`, `shift_type`, `start_time`, `end_time`, `break_start`, `break_end`, `notes`) 
                               VALUES ('$employee_id', '$new_rota_id', '$shift_date', '$shift_type', '$start_time', '$end_time', " . 
                               ($break_start ? "'$break_start'" : "NULL") . ", " . 
                               ($break_end ? "'$break_end'" : "NULL") . ", '$notes')";
                mysqli_query($con, $sql_insert);
                $success_count++;
            }
        }

        mysqli_commit($con);
        $response->status = "success";
        $response->message = "Rota applied and saved as new template '$new_rota_name'. ($success_count shifts created)";
        $response->new_rota_id = $new_rota_id;

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

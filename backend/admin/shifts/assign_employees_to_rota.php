<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$rota_id = $obj['rota_id'] ?? null;
$employee_ids = $obj['employee_ids'] ?? [];

$response = new stdClass();

if ($rota_id && is_array($employee_ids) && count($employee_ids) > 0) {
    mysqli_begin_transaction($con);
    
    try {
        $success_count = 0;
        
        foreach ($employee_ids as $emp_id) {
            // Fetch the employee's current salary and type
            $emp_query = mysqli_query($con, "SELECT salary, salary_type FROM employees WHERE employee_id = '$emp_id'");
            $emp_info = mysqli_fetch_assoc($emp_query);
            
            if ($emp_info) {
                $salary_amount = $emp_info['salary'];
                $salary_type = $emp_info['salary_type'];
                
                // Insert or Update the employee's salary in the rota
                $sql_rota_emp = "INSERT INTO `rota_employees` (`rota_id`, `employee_id`, `salary_amount`, `salary_type`) 
                                 VALUES ('$rota_id', '$emp_id', '$salary_amount', '$salary_type')
                                 ON DUPLICATE KEY UPDATE `salary_amount` = '$salary_amount', `salary_type` = '$salary_type'";
                                 
                if (mysqli_query($con, $sql_rota_emp)) {
                    $success_count++;
                }
            }
        }
        
        mysqli_commit($con);
        $response->status = "success";
        $response->message = "Successfully assigned $success_count employees to the rota with their current salaries.";
        
    } catch (Exception $e) {
        mysqli_rollback($con);
        $response->status = "error";
        $response->message = "An error occurred: " . $e->getMessage();
    }
} else {
    $response->status = "error";
    $response->message = "Invalid input. Please provide a valid rota_id and an array of employee_ids.";
}

echo json_encode($response);
?>

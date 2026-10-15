<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$id = $obj['rota_employee_id'] ?? null;
$salary_amount = $obj['salary_amount'] ?? null;
 
$response = new stdClass();

if ($id && $salary_amount ) {
    $sql = mysqli_query($con, "UPDATE `rota_employees` 
                               SET `salary_amount` = '$salary_amount' 
                               WHERE `id` = '$id'");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Employee assigned salary updated successfully for this rota.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Missing required fields (id, salary_amount).";
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];
$full_name = $obj['full_name'];
$email = $obj['email'];
$phone = $obj['phone'];
$role = $obj['role'];
$department = $obj['department'];
$join_date = $obj['join_date'];
$salary = $obj['salary'];
$salary_type = $obj['salary_type'];
$status = $obj['status'];

$response = new stdClass();

if ($employee_id) {
    $sql_update = mysqli_query($con, "UPDATE `employees` SET 
        `full_name` = '$full_name',
        `email` = '$email',
        `phone` = '$phone',
        `role` = '$role',
        `department` = '$department',
        `join_date` = '$join_date',
        `salary` = '$salary',
        `salary_type` = '$salary_type',
        `status` = '$status'
        WHERE `employee_id` = '$employee_id'");

    if ($sql_update) {
        $response->status = "success";
        $response->message = "Employee was successfully edited.";
    } else {
        $response->status = "error";
        $response->message = "An error occurred while editing.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

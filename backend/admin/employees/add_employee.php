<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$today = date("Y-m-d");

$full_name = $obj['full_name'];
$email = $obj['email'];
$phone = $obj['phone'];
$password = $obj['password']; // User might want to hash this, but I'll stick to their structure
$role = $obj['role'];
$department = $obj['department'];
$join_date = $obj['join_date'];
$salary = $obj['salary'];
$salary_type = $obj['salary_type'] ?? 'Monthly';
$status = $obj['status'] ?? 'Active';

$response = new stdClass();

if ($full_name && $email) {
    $sql = mysqli_query($con, "INSERT INTO `employees` (`full_name`, `email`, `phone`, `password`, `role`, `department`, `join_date`, `salary`, `salary_type`, `status`) 
    VALUES ('$full_name', '$email', '$phone', '$password', '$role', '$department', '$join_date', '$salary', '$salary_type', '$status')");

    $new_id = mysqli_insert_id($con);

    if ($new_id > 0) {
        $response->status = "success";
        $response->message = "Employee was successfully added.";
    } else {
        $response->status = "error";
        $response->message = "An error occurred while adding.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

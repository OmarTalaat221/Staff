<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];

$response = new stdClass();

if ($employee_id) {
    $sql_delete = mysqli_query($con, "DELETE FROM `employees` WHERE `employee_id` = '$employee_id'");

    if ($sql_delete) {
        $response->status = "success";
        $response->message = "Employee was successfully deleted.";
    } else {
        $response->status = "error";
        $response->message = "An error occurred while deleting.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

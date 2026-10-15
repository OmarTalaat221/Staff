<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];

$response = new stdClass();

if ($employee_id) {
    // Get current status
    $result = mysqli_query($con, "SELECT `status` FROM `employees` WHERE `employee_id` = '$employee_id'");
    $row = mysqli_fetch_assoc($result);

    if ($row) {
        $current_status = $row['status'];
        $new_status = ($current_status == 'Active') ? 'Inactive' : 'Active';

        $sql_update = mysqli_query($con, "UPDATE `employees` SET `status` = '$new_status' WHERE `employee_id` = '$employee_id'");

        if ($sql_update) {
            $response->status = "success";
            $response->message = "Status was successfully updated to $new_status.";
        } else {
            $response->status = "error";
            $response->message = "An error occurred while updating status.";
        }
    } else {
        $response->status = "error";
        $response->message = "Employee not found.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

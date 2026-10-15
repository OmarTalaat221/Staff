<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$leave_id = $obj['leave_id'];
$employee_id = $obj['employee_id'];

$response = new stdClass();

if ($leave_id && $employee_id) {
    // Only allow deletion if the request belongs to the employee and is still Pending
    $check = mysqli_query($con, "SELECT status FROM `leaves` WHERE leave_id = '$leave_id' AND employee_id = '$employee_id'");
    $row = mysqli_fetch_assoc($check);
    
    if ($row) {
        if ($row['status'] == 'Pending') {
            $sql = mysqli_query($con, "DELETE FROM `leaves` WHERE leave_id = '$leave_id'");
            if ($sql) {
                $response->status = "success";
                $response->message = "Request deleted successfully.";
            } else {
                $response->status = "error";
                $response->message = "Failed to delete request.";
            }
        } else {
            $response->status = "error";
            $response->message = "Cannot delete a request that has already been processed.";
        }
    } else {
        $response->status = "error";
        $response->message = "Request not found.";
    }
} else {
    $response->status = "error";
    $response->message = "Leave ID and Employee ID are required.";
}

echo json_encode($response);
?>

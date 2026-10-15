<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$leave_id = $obj['leave_id'];
$status = $obj['status']; // Approved or Rejected
$admin_notes = $obj['admin_notes'] ?? '';

$response = new stdClass();

if ($leave_id && $status) {
    if (in_array($status, ['Approved', 'Rejected'])) {
        $sql = mysqli_query($con, "UPDATE `leaves` SET status = '$status', admin_notes = '$admin_notes' WHERE leave_id = '$leave_id'");
        
        if ($sql) {
            $response->status = "success";
            $response->message = "Leave request updated to $status.";
        } else {
            $response->status = "error";
            $response->message = "Failed to update request.";
        }
    } else {
        $response->status = "error";
        $response->message = "Invalid status value.";
    }
} else {
    $response->status = "error";
    $response->message = "Leave ID and Status are required.";
}

echo json_encode($response);
?>

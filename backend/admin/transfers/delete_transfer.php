<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$transfer_id = $obj['transfer_id'];

$response = new stdClass();

if ($transfer_id) {
    $sql = mysqli_query($con, "DELETE FROM `transfers` WHERE transfer_id = '$transfer_id'");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Transfer deleted successfully.";
    } else {
        $response->status = "error";
        $response->message = "Failed to delete transfer.";
    }
} else {
    $response->status = "error";
    $response->message = "Transfer ID is required.";
}

echo json_encode($response);
?>

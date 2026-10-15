<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$shift_id = $obj['shift_id'];

$response = new stdClass();

if ($shift_id) {
    $sql_delete = mysqli_query($con, "DELETE FROM `shifts` WHERE `shift_id` = '$shift_id'");

    if ($sql_delete) {
        $response->status = "success";
        $response->message = "Shift was successfully deleted.";
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

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$shift_id = $obj['shift_id'];
$rota_id = isset($obj['rota_id']) ? "'" . mysqli_real_escape_string($con, $obj['rota_id']) . "'" : "`rota_id`"; // Keep existing if not passed
$employee_id = $obj['employee_id'];
$shift_date = $obj['shift_date'];
$shift_type = $obj['shift_type'];
$start_time = $obj['start_time'];
$end_time = $obj['end_time'];
$break_start = $obj['break_start'];
$break_end = $obj['break_end'];
$notes = $obj['notes'];

$response = new stdClass();

if ($shift_id && $employee_id) {
    $sql_update = mysqli_query($con, "UPDATE `shifts` SET 
        `employee_id` = '$employee_id',
        `rota_id` = $rota_id,
        `shift_date` = '$shift_date',
        `shift_type` = '$shift_type',
        `start_time` = '$start_time',
        `end_time` = '$end_time',
        `break_start` = '$break_start',
        `break_end` = '$break_end',
        `notes` = '$notes'
        WHERE `shift_id` = '$shift_id'");

    if ($sql_update) {
        $response->status = "success";
        $response->message = "Shift was successfully updated.";
    } else {
        $response->status = "error";
        $response->message = "An error occurred while updating.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

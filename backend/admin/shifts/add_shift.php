<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$today = date("Y-m-d");

$employee_id = $obj['employee_id'];
$rota_id = isset($obj['rota_id']) ? "'" . mysqli_real_escape_string($con, $obj['rota_id']) . "'" : "NULL";
$shift_date = $obj['shift_date'];
$shift_type = $obj['shift_type'];
$start_time = $obj['start_time'];
$end_time = $obj['end_time'];
$break_start = $obj['break_start'];
$break_end = $obj['break_end'];
$notes = $obj['notes'];

$response = new stdClass();

if ($employee_id && $shift_date) {
    $sql = mysqli_query($con, "INSERT INTO `shifts` (`employee_id`, `rota_id`, `shift_date`, `shift_type`, `start_time`, `end_time`, `break_start`, `break_end`, `notes`) 
    VALUES ('$employee_id', $rota_id, '$shift_date', '$shift_type', '$start_time', '$end_time', '$break_start', '$break_end', '$notes')");

    $new_id = mysqli_insert_id($con);

    if ($new_id > 0) {
        $response->status = "success";
        $response->message = "Shift was successfully assigned.";
    } else {
        $response->status = "error";
        $response->message = "An error occurred while assigning shift.";
    }
} else {
    $response->status = "error";
    $response->message = 'Something went wrong, please try again later.';
}

echo json_encode($response);
?>

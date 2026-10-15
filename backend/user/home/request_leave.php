<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];
$start_date = $obj['start_date'];
$end_date = $obj['end_date'];
$reason = $obj['reason'];
$handover = $obj['handover'] ?? '';

$response = new stdClass();

if ($employee_id && $start_date && $end_date && $reason) {
    $sql = mysqli_query($con, "INSERT INTO `leaves` (employee_id, start_date, end_date, reason, handover) 
                               VALUES ('$employee_id', '$start_date', '$end_date', '$reason', '$handover')");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Leave request submitted successfully.";
    } else {
        $response->status = "error";
        $response->message = "Failed to submit leave request.";
    }
} else {
    $response->status = "error";
    $response->message = "Required fields are missing.";
}

echo json_encode($response);
?>

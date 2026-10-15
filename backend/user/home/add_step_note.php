<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$step_id = $obj['step_id'] ?? null;
$employee_id = $obj['employee_id'] ?? null; // Nullable if created by admin or general
$note_text = isset($obj['note_text']) ? mysqli_real_escape_string($con, trim($obj['note_text'])) : null;

$response = new stdClass();

if ($step_id && $note_text !== null && $note_text !== '') {
    // Check if step exists
    $step_check = mysqli_query($con, "SELECT step_id FROM `sop_steps` WHERE step_id = '$step_id'");
    if (mysqli_num_rows($step_check) > 0) {
        $emp_val = $employee_id ? "'$employee_id'" : "NULL";

        $sql = "INSERT INTO `sop_step_notes` (step_id, employee_id, note_text) 
                VALUES ('$step_id', $emp_val, '$note_text')";

        if (mysqli_query($con, $sql)) {
            $response->status = "success";
            $response->message = "Note added successfully.";
            $response->note_id = mysqli_insert_id($con);
        } else {
            $response->status = "error";
            $response->message = "Failed to add note: " . mysqli_error($con);
        }
    } else {
        $response->status = "error";
        $response->message = "Step not found.";
    }
} else {
    $response->status = "error";
    $response->message = "Missing required parameters (step_id, note_text).";
}

echo json_encode($response);

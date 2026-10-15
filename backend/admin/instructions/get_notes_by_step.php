<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$step_id = $obj['step_id'] ?? ($_GET['step_id'] ?? null);

$response = new stdClass();
$notes = array();

if ($step_id) {
    $step_id = mysqli_real_escape_string($con, $step_id);
    
    $query = "SELECT n.*, e.full_name as employee_name, s.step_text 
              FROM `sop_step_notes` n 
              LEFT JOIN `employees` e ON n.employee_id = e.employee_id 
              JOIN `sop_steps` s ON n.step_id = s.step_id 
              WHERE n.step_id = '$step_id' 
              ORDER BY n.created_at DESC";

    $sql = mysqli_query($con, $query);

    if ($sql) {
        while ($row = mysqli_fetch_assoc($sql)) {
            $notes[] = $row;
        }
        $response->status = "success";
        $response->data = $notes;
    } else {
        $response->status = "error";
        $response->message = "Failed to fetch notes for this step: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Step ID is required.";
}

echo json_encode($response);
?>

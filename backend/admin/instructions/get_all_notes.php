<?php
include "../../db_con.php";

$response = new stdClass();
$notes = array();

$query = "SELECT n.*, e.full_name as employee_name, s.step_text, sop.title as sop_title 
          FROM `sop_step_notes` n 
          LEFT JOIN `employees` e ON n.employee_id = e.employee_id 
          JOIN `sop_steps` s ON n.step_id = s.step_id 
          JOIN `sops` sop ON s.sop_id = sop.sop_id 
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
    $response->message = "Failed to fetch notes: " . mysqli_error($con);
}

echo json_encode($response);
?>

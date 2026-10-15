<?php
include "../../db_con.php";

$response = new stdClass();
$sop_items = array();

// Fetch all SOPs with their category keys
$query = "SELECT s.*, c.category_key 
          FROM `sops` s 
          JOIN `sop_categories` c ON s.category_id = c.category_id 
          ORDER BY s.created_at DESC";

$sql = mysqli_query($con, $query);

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $sop_id = $row['sop_id'];
        
        $item = new stdClass();
        $item->id = (string)$sop_id;
        $item->title = $row['title'];
        $item->category = $row['category_key'];
        $item->tips = $row['tips'];
        
        // Fetch roles for this SOP
        $item->roles = array();
        $role_sql = mysqli_query($con, "SELECT role_key FROM `sop_roles` WHERE sop_id = '$sop_id'");
        while ($role_row = mysqli_fetch_assoc($role_sql)) {
            $item->roles[] = $role_row['role_key'];
        }
        
        // Fetch steps for this SOP
        $item->steps = array();
        $step_sql = mysqli_query($con, "SELECT * FROM `sop_steps` WHERE sop_id = '$sop_id' ORDER BY step_order ASC");
        while ($step_row = mysqli_fetch_assoc($step_sql)) {
            $step = new stdClass();
            $step->id = (string)$step_row['step_id'];
            $step->text = $step_row['step_text'];
            $step->note = $step_row['step_note'];
            $item->steps[] = $step;
        }
        
        $sop_items[] = $item;
    }
    $response->status = "success";
    $response->data = $sop_items;
} else {
    $response->status = "error";
    $response->message = "Failed to fetch instructions.";
}

echo json_encode($response);
?>

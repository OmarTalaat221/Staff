<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$title = $obj['title'];
$category_id = $obj['category_id'];
$tips = $obj['tips'] ?? '';
$roles = $obj['roles'] ?? []; // Array of role keys
$steps = $obj['steps'] ?? []; // Array of objects {text, note}

$response = new stdClass();

if ($title && $category_id) {
    // 1. Insert SOP
    $sql = mysqli_query($con, "INSERT INTO `sops` (title, category_id, tips) VALUES ('$title', '$category_id', '$tips')");
    $sop_id = mysqli_insert_id($con);
    
    if ($sop_id > 0) {
        // 2. Insert Roles
        foreach ($roles as $role_key) {
            mysqli_query($con, "INSERT INTO `sop_roles` (sop_id, role_key) VALUES ('$sop_id', '$role_key')");
        }
        
        // 3. Insert Steps
        $order = 0;
        foreach ($steps as $step) {
            $text = $step['text'];
            $note = $step['note'] ?? '';
            mysqli_query($con, "INSERT INTO `sop_steps` (sop_id, step_text, step_note, step_order) 
                               VALUES ('$sop_id', '$text', '$note', '$order')");
            $order++;
        }
        
        $response->status = "success";
        $response->message = "SOP added successfully.";
        $response->sop_id = $sop_id;
    } else {
        $response->status = "error";
        $response->message = "Failed to create SOP.";
    }
} else {
    $response->status = "error";
    $response->message = "Title and Category are required.";
}

echo json_encode($response);
?>

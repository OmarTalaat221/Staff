<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$name = isset($obj['name']) ? mysqli_real_escape_string($con, trim($obj['name'])) : null;

$response = new stdClass();

if ($name !== null && $name !== '') {
    $key = strtolower(str_replace(' ', '_', $name)); // Generate a key
    $sql = mysqli_query($con, "INSERT INTO `sop_categories` (category_name, category_key) VALUES ('$name', '$key')");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Category added successfully.";
    } else {
        $response->status = "error";
        $response->message = "Failed to add category (it might already exist).";
    }
} else {
    $response->status = "error";
    $response->message = "Category name is required.";
}

echo json_encode($response);
?>

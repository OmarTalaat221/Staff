<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$is_active = isset($data['is_active']) ? ((int)$data['is_active'] ? 1 : 0) : 1;

$response = new stdClass();

if ($title !== '') {
    $stmt = mysqli_prepare($con, "INSERT INTO `daily_tasks` (title, description, is_active) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "ssi", $title, $description, $is_active);

    if (mysqli_stmt_execute($stmt)) {
        $response->status = "success";
        $response->message = "Task added successfully.";
        $response->id = mysqli_insert_id($con);
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Task title is required.";
}

echo json_encode($response);
?>

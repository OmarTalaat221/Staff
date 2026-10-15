<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$id = (int)($data['id'] ?? 0);
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$is_active = isset($data['is_active']) ? ((int)$data['is_active'] ? 1 : 0) : 1;

$response = new stdClass();

if ($id && $title !== '') {
    $stmt = mysqli_prepare($con, "UPDATE `daily_tasks` SET title = ?, description = ?, is_active = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ssii", $title, $description, $is_active, $id);

    if (mysqli_stmt_execute($stmt)) {
        $response->status = "success";
        $response->message = "Task updated successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Task ID and title are required.";
}

echo json_encode($response);
?>

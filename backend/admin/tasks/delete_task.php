<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$id = (int)($data['id'] ?? 0);

$response = new stdClass();

if ($id) {
    $stmt = mysqli_prepare($con, "DELETE FROM `daily_tasks` WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (mysqli_stmt_execute($stmt)) {
        $response->status = "success";
        $response->message = "Task deleted successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Task ID is required.";
}

echo json_encode($response);
?>

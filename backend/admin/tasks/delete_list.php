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
    // Items, assignments and checks are removed by ON DELETE CASCADE
    $stmt = mysqli_prepare($con, "DELETE FROM `task_lists` WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (mysqli_stmt_execute($stmt)) {
        $response->status = "success";
        $response->message = "List deleted successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "List ID is required.";
}

echo json_encode($response);
?>

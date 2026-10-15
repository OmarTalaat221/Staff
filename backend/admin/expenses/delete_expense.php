<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$id = $data['id'] ?? null;

$response = new stdClass();

if ($id) {
    $sql = mysqli_query($con, "DELETE FROM `expenses` WHERE `id` = '$id'");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Expense deleted successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Expense ID is required.";
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";

$response = new stdClass();

$sql = mysqli_query($con, "SELECT * FROM `daily_tasks` ORDER BY `id` DESC");

if ($sql) {
    $tasks = array();
    while ($row = mysqli_fetch_assoc($sql)) {
        $tasks[] = $row;
    }
    $response->status = "success";
    $response->data = $tasks;
} else {
    $response->status = "error";
    $response->message = "Database error: " . mysqli_error($con);
}

echo json_encode($response);
?>

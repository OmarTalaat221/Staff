<?php
include "../../db_con.php";

$month = $_GET['month'] ?? null;

$response = new stdClass();

if ($month) {
    // Format is expected to be YYYY-MM
    $query = "SELECT * FROM `expenses` WHERE `expense_month` = '$month' ORDER BY `expense_date` DESC";
} else {
    // Get all if no month is provided
    $query = "SELECT * FROM `expenses` ORDER BY `expense_date` DESC";
}

$sql = mysqli_query($con, $query);

if ($sql) {
    $expenses = array();
    while ($row = mysqli_fetch_assoc($sql)) {
        $expenses[] = $row;
    }
    $response->status = "success";
    $response->data = $expenses;
} else {
    $response->status = "error";
    $response->message = "Database error: " . mysqli_error($con);
}

echo json_encode($response);
?>

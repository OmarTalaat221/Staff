<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);


include "../../db_con.php";

mysqli_set_charset($con, "utf8mb4");

$response = new stdClass();

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!is_array($data)) {
    $data = $_POST;
}

$id = isset($data["id"]) ? (int)$data["id"] : 0;
$title = isset($data["title"]) ? trim($data["title"]) : "";
$amount = isset($data["amount"]) ? $data["amount"] : null;
$expense_date = isset($data["expense_date"]) ? trim($data["expense_date"]) : "";
$notes = isset($data["notes"]) ? trim($data["notes"]) : "";
$payment_method = isset($data["payment_method"]) ? trim($data["payment_method"]) : "";

if ($id <= 0 || $title === "" || $amount === null || $amount === "" || $expense_date === "") {
    $response->status = "error";
    $response->message = "All required fields must be filled.";
    echo json_encode($response);
    exit;
}

$amount = (float)$amount;
$expense_month = substr($expense_date, 0, 7);

$stmt = mysqli_prepare($con, "
    UPDATE expenses 
    SET 
        title = ?,
        amount = ?,
        expense_date = ?,
        expense_month = ?,
        notes = ?,
        payment_method = ?
    WHERE id = ?
");

if (!$stmt) {
    $response->status = "error";
    $response->message = "Prepare failed: " . mysqli_error($con);
    echo json_encode($response);
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "sdssssi",
    $title,
    $amount,
    $expense_date,
    $expense_month,
    $notes,
    $payment_method,
    $id
);

if (mysqli_stmt_execute($stmt)) {
    $response->status = "success";
    $response->message = "Expense updated successfully.";
    $response->affected_rows = mysqli_stmt_affected_rows($stmt);
} else {
    $response->status = "error";
    $response->message = "Database error: " . mysqli_stmt_error($stmt);
}

mysqli_stmt_close($stmt);

echo json_encode($response);
?>
<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$title = $data['title'] ?? null;
$amount = $data['amount'] ?? null;
$expense_date = $data['expense_date'] ?? null;
$expense_month = $data['expense_month'] ?? null;
$notes = $data['notes'] ?? '';
$payment_method = $data['payment_method'] ?? '';

$response = new stdClass();

if ($title && $amount && $expense_date) {
    // Calculate expense_month from expense_date (e.g., "2026-05-17" -> "2026-05")
    // $expense_month = substr($expense_date, 0, 7);

    $sql = mysqli_query($con, "INSERT INTO `expenses` (title, amount, expense_date, expense_month, notes, payment_method) 
                               VALUES ('$title', '$amount', '$expense_date', '$expense_month', '$notes', '$payment_method')");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Expense added successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "All required fields (title, amount, expense_date) must be filled.";
}

echo json_encode($response);
?>

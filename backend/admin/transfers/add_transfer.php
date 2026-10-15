<?php
include "../../db_con.php";
include "../uploader.php";

// Smart data handling: check JSON first, then $_POST
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$employee_id = $data['employee_id'] ?? null;
$type = $data['type'] ?? null; 
$amount = $data['amount'] ?? null;
$method = $data['method'] ?? null; 
$transfer_month = $data['transfer_month'] ?? null; 
$notes = $data['notes'] ?? '';

$response = new stdClass();

if ($employee_id && $type && $amount && $method && $transfer_month) {
    $reference = "TXN-" . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
    $attachment_path = "";
    
    // 1. Check for real file upload (form-data)
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $dir = "../../uploads/transfers/";
        if (!is_dir($dir)) { mkdir($dir, 0777, true); }
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $file_name = $reference . "." . $ext;
        $file_path = $dir . $file_name;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $file_path)) {
            $attachment_path = "uploads/transfers/" . $file_name;
        }
    } 
    // 2. Check for base64 (JSON)
    elseif (isset($data['image']) && strlen($data['image']) > 100) {
        $attachment_path = uploadImage($data['image'], "uploads/transfers/");
    }
    
    $sql = mysqli_query($con, "INSERT INTO `transfers` (employee_id, type, amount, method, reference, transfer_month, notes, attachment) 
                               VALUES ('$employee_id', '$type', '$amount', '$method', '$reference', '$transfer_month', '$notes', '$attachment_path')");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Transfer created successfully.";
        $response->reference = $reference;
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "All required fields must be filled.";
    // Debug info to see what was received
    $response->received = $data; 
}

echo json_encode($response);
?>

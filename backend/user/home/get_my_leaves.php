<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];

$response = new stdClass();
$leaves = array();

if ($employee_id) {
    $sql = mysqli_query($con, "SELECT * FROM `leaves` WHERE employee_id = '$employee_id' ORDER BY created_at DESC");
    
    if ($sql) {
        while ($row = mysqli_fetch_assoc($sql)) {
            $leaves[] = $row;
        }
        $response->status = "success";
        $response->data = $leaves;
    } else {
        $response->status = "error";
        $response->message = "Failed to fetch leave requests.";
    }
} else {
    $response->status = "error";
    $response->message = "Employee ID is required.";
}

echo json_encode($response);
?>

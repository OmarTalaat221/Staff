<?php
include "../../db_con.php";

$response = new stdClass();
$leaves = array();

$query = "SELECT l.*, e.full_name, e.role, e.department 
          FROM `leaves` l 
          JOIN `employees` e ON l.employee_id = e.employee_id 
          ORDER BY l.created_at DESC";

$sql = mysqli_query($con, $query);

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

echo json_encode($response);
?>

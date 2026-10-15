<?php
include "../../db_con.php";

$response = new stdClass();
$employees = array();

$sql = mysqli_query($con, "SELECT * FROM `employees` ORDER BY `employee_id` DESC");

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $employees[] = $row;
    }
    $response->status = "success";
    $response->data = $employees;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching data.";
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";

$response = new stdClass();
$shifts = array();

$sql = mysqli_query($con, "SELECT s.*, e.full_name, e.role FROM `shifts` s JOIN `employees` e ON s.employee_id = e.employee_id ORDER BY s.shift_date DESC, s.start_time ASC");

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $shifts[] = $row;
    }
    $response->status = "success";
    $response->data = $shifts;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching shifts.";
}

echo json_encode($response);
?>

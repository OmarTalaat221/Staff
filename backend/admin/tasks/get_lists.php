<?php
include "../../db_con.php";

$response = new stdClass();

$sql = mysqli_query($con, "SELECT * FROM `task_lists` ORDER BY `id` DESC");

if ($sql) {
    $lists = array();
    while ($row = mysqli_fetch_assoc($sql)) {
        $list_id = (int)$row['id'];

        $row['items'] = array();
        $itemsQuery = mysqli_query($con, "SELECT id, title, sort_order FROM `task_list_items` WHERE list_id = '$list_id' ORDER BY sort_order ASC, id ASC");
        while ($itemsQuery && $item = mysqli_fetch_assoc($itemsQuery)) {
            $row['items'][] = $item;
        }

        $row['employees'] = array();
        $employeesQuery = mysqli_query($con, "
            SELECT e.employee_id, e.full_name
            FROM `task_list_employees` le
            JOIN `employees` e ON e.employee_id = le.employee_id
            WHERE le.list_id = '$list_id'
            ORDER BY e.full_name ASC
        ");
        while ($employeesQuery && $employee = mysqli_fetch_assoc($employeesQuery)) {
            $row['employees'][] = $employee;
        }

        $lists[] = $row;
    }
    $response->status = "success";
    $response->data = $lists;
} else {
    $response->status = "error";
    $response->message = "Database error: " . mysqli_error($con);
}

echo json_encode($response);
?>

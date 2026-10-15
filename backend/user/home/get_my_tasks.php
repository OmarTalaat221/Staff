<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = (int)($obj['employee_id'] ?? 0);
$attendance_id = (int)($obj['attendance_id'] ?? 0);

$response = new stdClass();

if ($employee_id) {
    // Lists assigned to the employee, with the items checked during this attendance
    $daily_tasks = array("opening" => array(), "closing" => array());
    $lists = array();
    $tasksQuery = mysqli_query($con, "
        SELECT l.id AS list_id, l.title AS list_title, l.type, i.id AS item_id, i.title, c.done_at, c.checked_by, ce.full_name AS checked_by_name
        FROM task_list_employees le
        JOIN task_lists l ON l.id = le.list_id AND l.is_active = 1
        JOIN task_list_items i ON i.list_id = l.id
        LEFT JOIN attendance_task_checks c ON c.item_id = i.id AND c.attendance_id = '$attendance_id'
        LEFT JOIN employees ce ON ce.employee_id = c.checked_by
        WHERE le.employee_id = '$employee_id'
        ORDER BY l.id ASC, i.sort_order ASC, i.id ASC
    ");
    while ($tasksQuery && $row = mysqli_fetch_assoc($tasksQuery)) {
        if (!isset($lists[$row['list_id']])) {
            $lists[$row['list_id']] = array("list_id" => $row['list_id'], "title" => $row['list_title'], "type" => $row['type'], "items" => array());
        }
        $lists[$row['list_id']]['items'][] = array("item_id" => $row['item_id'], "title" => $row['title'], "is_done" => $row['done_at'] ? 1 : 0, "done_at" => $row['done_at'], "checked_by" => $row['checked_by'], "checked_by_name" => $row['checked_by_name']);
    }
    foreach ($lists as $list) {
        $daily_tasks[$list['type']][] = $list;
    }

    $response->status = "success";
    $response->data = $daily_tasks;
} else {
    $response->status = "error";
    $response->message = "employee_id is required.";
}

echo json_encode($response);
?>

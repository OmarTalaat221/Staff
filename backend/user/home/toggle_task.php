<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = (int)($obj['employee_id'] ?? 0);
$attendance_id = (int)($obj['attendance_id'] ?? 0);
$item_id = (int)($obj['item_id'] ?? 0);
$is_done = isset($obj['is_done']) ? ((int)$obj['is_done'] ? 1 : 0) : 1;

$response = new stdClass();

if ($employee_id && $attendance_id && $item_id) {
    // The attendance log must belong to the employee
    $stmt = mysqli_prepare($con, "SELECT attendance_id FROM attendance WHERE attendance_id = ? AND employee_id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "ii", $attendance_id, $employee_id);
    mysqli_stmt_execute($stmt);
    $attendance = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    // The item must be in a list assigned to the employee
    $stmt = mysqli_prepare($con, "
        SELECT i.id
        FROM task_list_items i
        JOIN task_list_employees le ON le.list_id = i.list_id
        WHERE i.id = ? AND le.employee_id = ?
        LIMIT 1
    ");
    mysqli_stmt_bind_param($stmt, "ii", $item_id, $employee_id);
    mysqli_stmt_execute($stmt);
    $item = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if ($attendance && $item) {
        if ($is_done) {
            $saved = mysqli_query($con, "INSERT IGNORE INTO attendance_task_checks (attendance_id, item_id, done_at, checked_by) VALUES ('$attendance_id', '$item_id', NOW(), '$employee_id')");
        } else {
            $saved = mysqli_query($con, "DELETE FROM attendance_task_checks WHERE attendance_id = '$attendance_id' AND item_id = '$item_id'");
        }

        if ($saved) {
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
            $response->message = $is_done ? "Task marked as done." : "Task marked as not done.";
            $response->data = $daily_tasks;
        } else {
            $response->status = "error";
            $response->message = "Database error: " . mysqli_error($con);
        }
    } else {
        $response->status = "error";
        $response->message = "Task not found.";
    }
} else {
    $response->status = "error";
    $response->message = "employee_id, attendance_id and item_id are required.";
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = (int)($obj['employee_id'] ?? 0);
$attendance_task_id = (int)($obj['attendance_task_id'] ?? 0);
$is_done = isset($obj['is_done']) ? ((int)$obj['is_done'] ? 1 : 0) : 1;

$response = new stdClass();

if ($employee_id && $attendance_task_id) {
    // Make sure the task belongs to one of this employee's attendance logs
    $stmt = mysqli_prepare($con, "
        SELECT at.id, at.attendance_id
        FROM attendance_tasks at
        JOIN attendance a ON a.attendance_id = at.attendance_id
        WHERE at.id = ? AND a.employee_id = ?
        LIMIT 1
    ");
    mysqli_stmt_bind_param($stmt, "ii", $attendance_task_id, $employee_id);
    mysqli_stmt_execute($stmt);
    $task = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if ($task) {
        if ($is_done) {
            $stmt = mysqli_prepare($con, "UPDATE attendance_tasks SET is_done = 1, done_at = NOW(), done_by = 'user' WHERE id = ?");
        } else {
            $stmt = mysqli_prepare($con, "UPDATE attendance_tasks SET is_done = 0, done_at = NULL, done_by = NULL WHERE id = ?");
        }
        mysqli_stmt_bind_param($stmt, "i", $attendance_task_id);

        if (mysqli_stmt_execute($stmt)) {
            $tasks = array("opening" => array(), "closing" => array());
            $tasksQuery = mysqli_query($con, "
                SELECT at.id, at.task_id, at.type, t.title, t.description, at.is_done, at.done_at, at.done_by
                FROM attendance_tasks at
                JOIN daily_tasks t ON t.id = at.task_id
                WHERE at.attendance_id = '{$task['attendance_id']}'
                ORDER BY at.id ASC
            ");
            while ($tasksQuery && $taskRow = mysqli_fetch_assoc($tasksQuery)) {
                $tasks[$taskRow['type']][] = $taskRow;
            }

            $response->status = "success";
            $response->message = $is_done ? "Task marked as done." : "Task marked as not done.";
            $response->data = $tasks;
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
    $response->message = "employee_id and attendance_task_id are required.";
}

echo json_encode($response);
?>

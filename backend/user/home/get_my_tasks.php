<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = (int)($obj['employee_id'] ?? 0);
$attendance_id = (int)($obj['attendance_id'] ?? 0);

$response = new stdClass();

if ($employee_id && $attendance_id) {
    // Make sure the attendance log belongs to this employee
    $stmt = mysqli_prepare($con, "SELECT attendance_id FROM attendance WHERE attendance_id = ? AND employee_id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "ii", $attendance_id, $employee_id);
    mysqli_stmt_execute($stmt);
    $owned = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if ($owned) {
        $tasks = array();
        $tasksQuery = mysqli_query($con, "
            SELECT at.id, at.task_id, t.title, t.description, at.is_done, at.done_at, at.done_by
            FROM attendance_tasks at
            JOIN daily_tasks t ON t.id = at.task_id
            WHERE at.attendance_id = '$attendance_id'
            ORDER BY at.id ASC
        ");
        while ($tasksQuery && $taskRow = mysqli_fetch_assoc($tasksQuery)) {
            $tasks[] = $taskRow;
        }

        $response->status = "success";
        $response->data = $tasks;
    } else {
        $response->status = "error";
        $response->message = "Attendance log not found.";
    }
} else {
    $response->status = "error";
    $response->message = "employee_id and attendance_id are required.";
}

echo json_encode($response);
?>

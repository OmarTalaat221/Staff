<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include "../../db_con.php";

$response = new stdClass();
$logs = array();

$employee_id = isset($_POST['employee_id']) ? $_POST['employee_id'] : (isset($_GET['employee_id']) ? $_GET['employee_id'] : null);
$date = isset($_POST['date']) ? $_POST['date'] : (isset($_GET['date']) ? $_GET['date'] : null);

if (!$employee_id || !$date) {
    $response->status = "error";
    $response->message = "Missing employee_id or date.";
    echo json_encode($response);
    exit;
}

$employee_id = mysqli_real_escape_string($con, $employee_id);
$date = mysqli_real_escape_string($con, $date);

$query = "SELECT 
            s.shift_id,
            s.shift_date,
            s.start_time,
            s.end_time,
            s.shift_type,
            a.attendance_id,
            a.check_in_time,
            a.check_out_time,
            a.late_arrival_minutes,
            a.late_departure_minutes
          FROM `shifts` s
          LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND s.employee_id = a.employee_id
          WHERE s.employee_id = '$employee_id' AND s.shift_date = '$date'
          ORDER BY s.start_time ASC";

$sql = mysqli_query($con, $query);

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $row['daily_tasks'] = array();
        if ($row['attendance_id']) {
            $tasksQuery = mysqli_query($con, "
                SELECT at.id, at.task_id, at.type, t.title, t.description, at.is_done, at.done_at, at.done_by
                FROM attendance_tasks at
                JOIN daily_tasks t ON t.id = at.task_id
                WHERE at.attendance_id = '{$row['attendance_id']}'
                ORDER BY at.id ASC
            ");
            while ($tasksQuery && $taskRow = mysqli_fetch_assoc($tasksQuery)) {
                $row['daily_tasks'][] = $taskRow;
            }
        }
        $logs[] = $row;
    }
    $response->status = "success";
    $response->data = $logs;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching data.";
}

echo json_encode($response);
?>

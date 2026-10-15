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
        // Task lists assigned to the employee, with what was checked in this shift
        $row['daily_tasks'] = array("opening" => array(), "closing" => array());
        try {
            $lists = array();
            $tasksQuery = mysqli_query($con, "
                SELECT l.id AS list_id, l.title AS list_title, l.type, i.id AS item_id, i.title, c.done_at, c.checked_by, ce.full_name AS checked_by_name
                FROM task_list_employees le
                JOIN task_lists l ON l.id = le.list_id AND l.is_active = 1
                JOIN task_list_items i ON i.list_id = l.id
                LEFT JOIN attendance_task_checks c ON c.item_id = i.id AND c.attendance_id = '{$row['attendance_id']}'
                LEFT JOIN employees ce ON ce.employee_id = c.checked_by
                WHERE le.employee_id = '$employee_id'
                ORDER BY l.id ASC, i.sort_order ASC, i.id ASC
            ");
            while ($tasksQuery && $taskRow = mysqli_fetch_assoc($tasksQuery)) {
                if (!isset($lists[$taskRow['list_id']])) {
                    $lists[$taskRow['list_id']] = array("list_id" => $taskRow['list_id'], "title" => $taskRow['list_title'], "type" => $taskRow['type'], "items" => array());
                }
                $lists[$taskRow['list_id']]['items'][] = array("item_id" => $taskRow['item_id'], "title" => $taskRow['title'], "is_done" => $taskRow['done_at'] ? 1 : 0, "done_at" => $taskRow['done_at'], "checked_by" => $taskRow['checked_by'], "checked_by_name" => $taskRow['checked_by_name']);
            }
            foreach ($lists as $list) {
                $row['daily_tasks'][$list['type']][] = $list;
            }
        } catch (Exception $e) {
            // keep returning the logs without tasks, but report why
            $response->tasks_error = $e->getMessage();
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

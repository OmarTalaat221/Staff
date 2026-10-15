<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'] ?? null;
$today = date("Y-m-d");

$response = new stdClass();

if ($employee_id) {
    $current_shift = null;
    $shift_status = "no_shift";

    // 1. Check if there is an active checked-in shift (checked in but not checked out yet)
    // This handles shift across days or active shifts accurately
    $active_query = mysqli_query($con, "
        SELECT s.*, a.attendance_id, a.check_in_time, a.check_out_time, 
               a.late_arrival_minutes, a.late_departure_minutes 
        FROM `attendance` a 
        JOIN `shifts` s ON a.shift_id = s.shift_id 
        WHERE a.employee_id = '$employee_id' AND a.check_out_time IS NULL 
        LIMIT 1
    ");

    if ($active_query && mysqli_num_rows($active_query) > 0) {
        $current_shift = mysqli_fetch_assoc($active_query);
        $shift_status = "checked_in";
    } else {
        // 2. No active check-in, look for shifts scheduled for today
        $shifts_query = mysqli_query($con, "
            SELECT s.*, a.attendance_id, a.check_in_time, a.check_out_time, 
                   a.late_arrival_minutes, a.late_departure_minutes 
            FROM `shifts` s 
            LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND a.employee_id = s.employee_id
            WHERE s.employee_id = '$employee_id' 
            AND s.shift_date = '$today' 
            ORDER BY s.start_time ASC
        ");

        if ($shifts_query && mysqli_num_rows($shifts_query) > 0) {
            $shifts_today = [];
            while ($row = mysqli_fetch_assoc($shifts_query)) {
                $shifts_today[] = $row;
            }

            // Find the first shift that has not been checked in yet
            $found = false;
            foreach ($shifts_today as $shift_row) {
                if ($shift_row['attendance_id'] === null) {
                    $current_shift = $shift_row;
                    $shift_status = "not_checked_in";
                    $found = true;
                    break;
                }
            }

            // If all shifts scheduled for today are checked out, get the last one
            if (!$found) {
                $current_shift = end($shifts_today);
                $shift_status = "not_checked_in";
            }
        }
    }

    $response->status = "success";
    $response->shift_status = $shift_status;

    if ($current_shift) {
        $shift = new stdClass();
        $shift->shift_id = $current_shift['shift_id'];
        $shift->date = $current_shift['shift_date'];
        $shift->start = substr($current_shift['start_time'], 0, 5); // Format to HH:mm
        $shift->end = substr($current_shift['end_time'], 0, 5);
        $shift->breakStart = $current_shift['break_start'] ? substr($current_shift['break_start'], 0, 5) : "";
        $shift->breakEnd = $current_shift['break_end'] ? substr($current_shift['break_end'], 0, 5) : "";
        $shift->note = $current_shift['notes'];

        // Attendance details
        $shift->attendance = new stdClass();
        $shift->attendance->id = $current_shift['attendance_id'] ?? null;
        $shift->attendance->check_in = $current_shift['check_in_time'] ? substr($current_shift['check_in_time'], 11, 5) : null;
        $shift->attendance->check_out = $current_shift['check_out_time'] ? substr($current_shift['check_out_time'], 11, 5) : null;
        $shift->attendance->late_arrival = $current_shift['late_arrival_minutes'] ?? 0;
        $shift->attendance->late_departure = $current_shift['late_departure_minutes'] ?? 0;
        // Task lists assigned to the employee, with what was checked in this shift
        $shift->attendance->daily_tasks = array("opening" => array(), "closing" => array());
        try {
            $lists = array();
            $tasksQuery = mysqli_query($con, "
                SELECT l.id AS list_id, l.title AS list_title, l.type, i.id AS item_id, i.title, c.done_at, c.checked_by, ce.full_name AS checked_by_name
                FROM task_list_employees le
                JOIN task_lists l ON l.id = le.list_id AND l.is_active = 1
                JOIN task_list_items i ON i.list_id = l.id
                LEFT JOIN attendance_task_checks c ON c.item_id = i.id AND c.attendance_id = '{$shift->attendance->id}'
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
                $shift->attendance->daily_tasks[$list['type']][] = $list;
            }
        } catch (Exception $e) {
            // keep returning the logs without tasks, but report why
            $response->tasks_error = $e->getMessage();
        }

        $response->data = $shift;
    } else {
        $response->data = null;
    }
} else {
    $response->status = "error";
    $response->message = 'Employee ID is required.';
}

echo json_encode($response);
?>

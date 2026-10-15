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
        $shift->attendance->daily_tasks = array("opening" => array(), "closing" => array());
        if ($shift->attendance->id) {
            $tasksQuery = mysqli_query($con, "
                SELECT at.id, at.task_id, at.type, t.title, t.description, at.is_done, at.done_at, at.done_by
                FROM attendance_tasks at
                JOIN daily_tasks t ON t.id = at.task_id
                WHERE at.attendance_id = '{$shift->attendance->id}'
                ORDER BY at.id ASC
            ");
            while ($tasksQuery && $taskRow = mysqli_fetch_assoc($tasksQuery)) {
                $shift->attendance->daily_tasks[$taskRow['type']][] = $taskRow;
            }
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

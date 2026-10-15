<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];
$today = date("Y-m-d");

$response = new stdClass();
$shifts = array();

if ($employee_id) {
    // Fetch shifts from today onwards and their corresponding attendance records
    $sql = mysqli_query($con, "SELECT s.*, a.attendance_id, a.check_in_time, a.check_out_time, a.late_arrival_minutes, a.late_departure_minutes 
                               FROM `shifts` s 
                               LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND a.employee_id = s.employee_id
                               WHERE s.employee_id = '$employee_id' 
                               AND s.shift_date >= '$today' 
                               ORDER BY s.shift_date ASC");

    if ($sql) {
        while ($row = mysqli_fetch_assoc($sql)) {
            $shift = new stdClass();
            $shift->shift_id = $row['shift_id'];
            $shift->date = $row['shift_date'];
            $shift->start = substr($row['start_time'], 0, 5); // Format to HH:mm
            $shift->end = substr($row['end_time'], 0, 5);
            $shift->breakStart = $row['break_start'] ? substr($row['break_start'], 0, 5) : "";
            $shift->breakEnd = $row['break_end'] ? substr($row['break_end'], 0, 5) : "";
            $shift->note = $row['notes'];
            
            // Attendance details
            $shift->attendance = new stdClass();
            $shift->attendance->id = $row['attendance_id'] ?? null;
            $shift->attendance->check_in = $row['check_in_time'] ? substr($row['check_in_time'], 11, 5) : null;
            $shift->attendance->check_out = $row['check_out_time'] ? substr($row['check_out_time'], 11, 5) : null;
            $shift->attendance->late_arrival = $row['late_arrival_minutes'] ?? 0;
            $shift->attendance->late_departure = $row['late_departure_minutes'] ?? 0;
            
            $shifts[] = $shift;
        }
        $response->status = "success";
        $response->data = $shifts;
    } else {
        $response->status = "error";
        $response->message = "An error occurred while fetching shifts.";
    }
} else {
    $response->status = "error";
    $response->message = 'Employee ID is required.';
}

echo json_encode($response);
?>

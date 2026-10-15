<?php


include "../../db_con.php";


$response = new stdClass();

$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    $input = array();
}

function hasParam($key) {
    global $input;
    return array_key_exists($key, $input) || isset($_POST[$key]) || isset($_GET[$key]);
}

function getParam($key, $default = null) {
    global $input;

    if (array_key_exists($key, $input)) {
        return $input[$key];
    }

    if (isset($_POST[$key])) {
        return $_POST[$key];
    }

    if (isset($_GET[$key])) {
        return $_GET[$key];
    }

    return $default;
}

function normalizeDateTimeValue($value) {
    if ($value === null) {
        return null;
    }

    $value = trim((string)$value);

    if ($value === "") {
        return null;
    }

    $value = str_replace("T", " ", $value);

    if (strlen($value) === 16) {
        $value .= ":00";
    }

    return $value;
}

function normalizeDecimalValue($value) {
    if ($value === null) {
        return null;
    }

    $value = trim((string)$value);

    if ($value === "") {
        return null;
    }

    return (float)$value;
}

function calculateLateArrivalMinutes($checkInTime, $shiftDate, $startTime) {
    if (!$checkInTime) {
        return 0;
    }

    $scheduledStart = strtotime($shiftDate . " " . $startTime);
    $actualCheckIn = strtotime($checkInTime);

    if ($scheduledStart === false || $actualCheckIn === false) {
        return 0;
    }

    $diff = floor(($actualCheckIn - $scheduledStart) / 60);

    return $diff > 0 ? $diff : 0;
}

function calculateLateDepartureMinutes($checkOutTime, $shiftDate, $startTime, $endTime) {
    if (!$checkOutTime) {
        return 0;
    }

    $endDate = $shiftDate;

    if (strtotime($endTime) <= strtotime($startTime)) {
        $endDate = date("Y-m-d", strtotime($shiftDate . " +1 day"));
    }

    $scheduledEnd = strtotime($endDate . " " . $endTime);
    $actualCheckOut = strtotime($checkOutTime);

    if ($scheduledEnd === false || $actualCheckOut === false) {
        return 0;
    }

    $diff = floor(($actualCheckOut - $scheduledEnd) / 60);

    return $diff > 0 ? $diff : 0;
}

$employee_id = getParam("employee_id");
$shift_id = getParam("shift_id");
$date = getParam("date", null);
$attendance_id = getParam("attendance_id", null);

if (!$employee_id || !$shift_id) {
    $response->status = "error";
    $response->message = "Missing employee_id or shift_id.";
    echo json_encode($response);
    exit;
}

$employee_id = (int)$employee_id;
$shift_id = (int)$shift_id;
$attendance_id = $attendance_id ? (int)$attendance_id : null;

if ($date) {
    $stmt = mysqli_prepare($con, "SELECT shift_id, employee_id, shift_date, start_time, end_time FROM shifts WHERE shift_id = ? AND employee_id = ? AND shift_date = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "iis", $shift_id, $employee_id, $date);
} else {
    $stmt = mysqli_prepare($con, "SELECT shift_id, employee_id, shift_date, start_time, end_time FROM shifts WHERE shift_id = ? AND employee_id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "ii", $shift_id, $employee_id);
}

mysqli_stmt_execute($stmt);
$shiftResult = mysqli_stmt_get_result($stmt);
$shift = mysqli_fetch_assoc($shiftResult);

if (!$shift) {
    $response->status = "error";
    $response->message = "Shift not found for this employee.";
    echo json_encode($response);
    exit;
}

$existingLog = null;

if ($attendance_id) {
    $stmt = mysqli_prepare($con, "SELECT * FROM attendance WHERE attendance_id = ? AND employee_id = ? AND shift_id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "iii", $attendance_id, $employee_id, $shift_id);
} else {
    $stmt = mysqli_prepare($con, "SELECT * FROM attendance WHERE employee_id = ? AND shift_id = ? ORDER BY attendance_id DESC LIMIT 1");
    mysqli_stmt_bind_param($stmt, "ii", $employee_id, $shift_id);
}

mysqli_stmt_execute($stmt);
$existingResult = mysqli_stmt_get_result($stmt);
$existingLog = mysqli_fetch_assoc($existingResult);

$check_in_time = hasParam("check_in_time")
    ? normalizeDateTimeValue(getParam("check_in_time"))
    : ($existingLog ? $existingLog["check_in_time"] : null);

$check_out_time = hasParam("check_out_time")
    ? normalizeDateTimeValue(getParam("check_out_time"))
    : ($existingLog ? $existingLog["check_out_time"] : null);

$check_in_lat = hasParam("check_in_lat")
    ? normalizeDecimalValue(getParam("check_in_lat"))
    : ($existingLog ? $existingLog["check_in_lat"] : null);

$check_in_long = hasParam("check_in_long")
    ? normalizeDecimalValue(getParam("check_in_long"))
    : ($existingLog ? $existingLog["check_in_long"] : null);

$check_out_lat = hasParam("check_out_lat")
    ? normalizeDecimalValue(getParam("check_out_lat"))
    : ($existingLog ? $existingLog["check_out_lat"] : null);

$check_out_long = hasParam("check_out_long")
    ? normalizeDecimalValue(getParam("check_out_long"))
    : ($existingLog ? $existingLog["check_out_long"] : null);

$late_arrival_minutes = calculateLateArrivalMinutes(
    $check_in_time,
    $shift["shift_date"],
    $shift["start_time"]
);

$late_departure_minutes = calculateLateDepartureMinutes(
    $check_out_time,
    $shift["shift_date"],
    $shift["start_time"],
    $shift["end_time"]
);

if (hasParam("late_arrival_minutes")) {
    $late_arrival_minutes = (int)getParam("late_arrival_minutes");
}

if (hasParam("late_departure_minutes")) {
    $late_departure_minutes = (int)getParam("late_departure_minutes");
}

if ($existingLog) {
    $attendance_id = (int)$existingLog["attendance_id"];

    $stmt = mysqli_prepare($con, "
        UPDATE attendance SET
            check_in_time = ?,
            check_out_time = ?,
            check_in_lat = ?,
            check_in_long = ?,
            check_out_lat = ?,
            check_out_long = ?,
            late_arrival_minutes = ?,
            late_departure_minutes = ?
        WHERE attendance_id = ?
    ");

    mysqli_stmt_bind_param(
        $stmt,
        "ssddddiii",
        $check_in_time,
        $check_out_time,
        $check_in_lat,
        $check_in_long,
        $check_out_lat,
        $check_out_long,
        $late_arrival_minutes,
        $late_departure_minutes,
        $attendance_id
    );

    $action = "updated";
} else {
    $stmt = mysqli_prepare($con, "
        INSERT INTO attendance (
            employee_id,
            shift_id,
            check_in_time,
            check_out_time,
            check_in_lat,
            check_in_long,
            check_out_lat,
            check_out_long,
            late_arrival_minutes,
            late_departure_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    mysqli_stmt_bind_param(
        $stmt,
        "iissddddii",
        $employee_id,
        $shift_id,
        $check_in_time,
        $check_out_time,
        $check_in_lat,
        $check_in_long,
        $check_out_lat,
        $check_out_long,
        $late_arrival_minutes,
        $late_departure_minutes
    );

    $action = "created";
}

if (!mysqli_stmt_execute($stmt)) {
    $response->status = "error";
    $response->message = "An error occurred while saving attendance log.";
    $response->mysql_error = mysqli_error($con);
    echo json_encode($response);
    exit;
}

if ($action === "created") {
    $attendance_id = mysqli_insert_id($con);
}

$stmt = mysqli_prepare($con, "
    SELECT 
        s.shift_id,
        s.shift_date,
        s.start_time,
        s.end_time,
        s.shift_type,
        a.attendance_id,
        a.check_in_time,
        a.check_out_time,
        a.check_in_lat,
        a.check_in_long,
        a.check_out_lat,
        a.check_out_long,
        a.late_arrival_minutes,
        a.late_departure_minutes
    FROM shifts s
    LEFT JOIN attendance a 
        ON s.shift_id = a.shift_id 
        AND s.employee_id = a.employee_id
        AND a.attendance_id = ?
    WHERE s.shift_id = ? 
      AND s.employee_id = ?
    LIMIT 1
");

mysqli_stmt_bind_param($stmt, "iii", $attendance_id, $shift_id, $employee_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$data = mysqli_fetch_assoc($result);

$response->status = "success";
$response->message = $action === "created" ? "Attendance log created successfully." : "Attendance log updated successfully.";
$response->action = $action;
$response->data = $data;

echo json_encode($response);
?>
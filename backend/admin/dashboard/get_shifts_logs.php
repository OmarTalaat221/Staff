<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "../../db_con.php";

$json = file_get_contents('php://input');
$obj = json_decode($json, true) ?? [];

// Inputs (supports both JSON POST and GET params)
$page = (int)($_GET['page'] ?? $obj['page'] ?? 1);
$pageSize = (int)($_GET['pageSize'] ?? $obj['pageSize'] ?? 10);
$startDate = $_GET['startDate'] ?? $obj['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? $obj['endDate'] ?? '';
$search = $_GET['search'] ?? $obj['search'] ?? '';
$department = $_GET['department'] ?? $obj['department'] ?? '';
$status_filter = $_GET['status'] ?? $obj['status'] ?? ''; // present, late, absent, onLeave

if ($page < 1) $page = 1;
if ($pageSize < 1) $pageSize = 10;

$response = new stdClass();

try {
    // 1. Build WHERE clauses for DB query
    $where_clauses = [];
    
    if (!empty($startDate)) {
        $where_clauses[] = "s.shift_date >= '" . mysqli_real_escape_string($con, $startDate) . "'";
    }
    if (!empty($endDate)) {
        $where_clauses[] = "s.shift_date <= '" . mysqli_real_escape_string($con, $endDate) . "'";
    }
    if (!empty($search)) {
        $search_esc = mysqli_real_escape_string($con, $search);
        $where_clauses[] = "e.full_name LIKE '%$search_esc%'";
    }
    if (!empty($department)) {
        $dept_esc = mysqli_real_escape_string($con, $department);
        $where_clauses[] = "e.department = '$dept_esc'";
    }

    $where = "";
    if (!empty($where_clauses)) {
        $where = " WHERE " . implode(" AND ", $where_clauses);
    }

    // 2. Fetch approved leaves within the range to check "onLeave" status
    $leaves_query = "SELECT employee_id, start_date, end_date FROM leaves WHERE status = 'Approved'";
    if (!empty($startDate) && !empty($endDate)) {
        $leaves_query .= " AND (start_date <= '" . mysqli_real_escape_string($con, $endDate) . "' AND end_date >= '" . mysqli_real_escape_string($con, $startDate) . "')";
    }
    $leaves_result = mysqli_query($con, $leaves_query);
    $approved_leaves = [];
    if ($leaves_result) {
        while ($l_row = mysqli_fetch_assoc($leaves_result)) {
            $approved_leaves[] = [
                'employee_id' => (int)$l_row['employee_id'],
                'start_date' => $l_row['start_date'],
                'end_date' => $l_row['end_date']
            ];
        }
    }

    // Helper function to check if employee was on leave on a specific date
    $is_on_leave = function($employee_id, $date) use ($approved_leaves) {
        foreach ($approved_leaves as $leave) {
            if ($leave['employee_id'] === $employee_id && $date >= $leave['start_date'] && $date <= $leave['end_date']) {
                return true;
            }
        }
        return false;
    };

    // 3. Fetch all matching shifts & attendance records
    $query = "SELECT s.*, e.full_name, e.role, e.department,
                     a.attendance_id, a.check_in_time, a.check_out_time, 
                     a.late_arrival_minutes, a.late_departure_minutes
              FROM `shifts` s
              JOIN `employees` e ON s.employee_id = e.employee_id
              LEFT JOIN `attendance` a ON s.shift_id = a.shift_id AND a.employee_id = s.employee_id" . $where . "
              ORDER BY s.shift_date DESC, s.start_time ASC";

    $sql = mysqli_query($con, $query);

    if (!$sql) {
        throw new Exception("Database query failed: " . mysqli_error($con));
    }

    $all_records = [];
    $today = date("Y-m-d");

    // Stats accumulator variables
    $stats = [
        "present" => 0,
        "late" => 0,
        "absent" => 0,
        "onLeave" => 0,
        "averageHours" => "0h 0m"
    ];
    $total_worked_minutes = 0;
    $attended_count_with_time = 0;

    // Process all shifts to determine dynamic fields (break, worked time, status)
    while ($row = mysqli_fetch_assoc($sql)) {
        $staffId = (int)$row['employee_id'];
        $shift_date = $row['shift_date'];
        
        // 3.1 Calculate Break Minutes
        $break_minutes = 0;
        if (!empty($row['break_start']) && !empty($row['break_end']) && $row['break_start'] !== '00:00:00' && $row['break_end'] !== '00:00:00') {
            $bStart = new DateTime($row['break_start']);
            $bEnd = new DateTime($row['break_end']);
            $bDiff = $bStart->diff($bEnd);
            $break_minutes = ($bDiff->h * 60) + $bDiff->i;
        }

        // 3.2 Calculate Worked Minutes
        $worked_minutes = 0;
        if (!empty($row['check_in_time']) && !empty($row['check_out_time'])) {
            $cIn = new DateTime($row['check_in_time']);
            $cOut = new DateTime($row['check_out_time']);
            $wDiff = $cIn->diff($cOut);
            $worked_minutes = ($wDiff->h * 60) + $wDiff->i;
        }

        // 3.3 Late and Overtime Minutes
        $late_minutes = isset($row['late_arrival_minutes']) ? (int)$row['late_arrival_minutes'] : 0;
        
        $overtime_minutes = 0;
        $late_departure = isset($row['late_departure_minutes']) ? (int)$row['late_departure_minutes'] : 0;
        if ($late_departure > 0) {
            $overtime_minutes = $late_departure;
        }

        // 3.4 Determine Attendance Status
        $status = "absent";
        if ($is_on_leave($staffId, $shift_date)) {
            $status = "onLeave";
        } else if ($row['attendance_id']) {
            if ($late_minutes > 0) {
                $status = "late";
            } else {
                $status = "present";
            }
        } else {
            // No check-in record
            if ($shift_date > $today) {
                $status = "upcoming";
            } else if ($shift_date == $today) {
                $current_time = date("H:i:s");
                if ($current_time < $row['start_time']) {
                    $status = "upcoming";
                } else {
                    $status = "absent";
                }
            } else {
                $status = "absent";
            }
        }

        // Format record
        $record = [
            "id" => $staffId . "-" . $shift_date,
            "staffId" => $staffId,
            "staffName" => $row['full_name'],
            "staffRole" => $row['role'],
            "department" => $row['department'],
            "date" => $shift_date,
            "shiftName" => $row['shift_type'] ?? 'Normal',
            "scheduledStart" => !empty($row['start_time']) ? substr($row['start_time'], 0, 5) : null,
            "scheduledEnd" => !empty($row['end_time']) ? substr($row['end_time'], 0, 5) : null,
            "checkIn" => !empty($row['check_in_time']) ? substr($row['check_in_time'], 11, 5) : null,
            "checkOut" => !empty($row['check_out_time']) ? substr($row['check_out_time'], 11, 5) : null,
            "breakMinutes" => $break_minutes,
            "workedMinutes" => $worked_minutes,
            "lateMinutes" => $late_minutes,
            "overtimeMinutes" => $overtime_minutes,
            "status" => $status
        ];

        // 3.5 Accumulate overall stats BEFORE applying status filter (for correct date-wide stats context)
        // We only accumulate stats for non-upcoming records
        if ($status !== 'upcoming') {
            if (isset($stats[$status])) {
                $stats[$status]++;
            }
            if ($status === 'present' || $status === 'late') {
                if ($worked_minutes > 0) {
                    $total_worked_minutes += $worked_minutes;
                    $attended_count_with_time++;
                }
            }
        }

        // 3.6 Filter records by status if a status filter is active
        if (!empty($status_filter)) {
            if ($status !== $status_filter) {
                continue; // Skip this record if it doesn't match the filtered status
            }
        }

        $all_records[] = $record;
    }

    // 4. Finalize Stats Calculations
    if ($attended_count_with_time > 0) {
        $avg_minutes = round($total_worked_minutes / $attended_count_with_time);
        $avg_hours = floor($avg_minutes / 60);
        $avg_mins = $avg_minutes % 60;
        $stats['averageHours'] = "{$avg_hours}h {$avg_mins}m";
    }

    // 5. Apply Pagination
    $totalCount = count($all_records);
    $offset = ($page - 1) * $pageSize;
    $paginated_records = array_slice($all_records, $offset, $pageSize);

    // 6. Output Successful Response
    echo json_encode([
        "success" => true,
        "totalCount" => $totalCount,
        "page" => $page,
        "pageSize" => $pageSize,
        "stats" => $stats,
        "records" => $paginated_records
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>

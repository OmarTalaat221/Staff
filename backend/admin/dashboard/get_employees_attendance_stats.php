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

$page = (int)($_GET['page'] ?? $obj['page'] ?? 1);
$pageSize = (int)($_GET['pageSize'] ?? $obj['pageSize'] ?? 10);
$search = $_GET['search'] ?? $obj['search'] ?? '';
$department = $_GET['department'] ?? $obj['department'] ?? '';

if ($page < 1) $page = 1;
if ($pageSize < 1) $pageSize = 10;

$response = new stdClass();

try {
    // Build WHERE clauses for DB query
    $where_clauses = [];
    
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

    // Fetch employee statistics
    // We left join shifts and attendance to calculate:
    // 1. Total late arrival (late_arrival_minutes)
    // 2. Total early arrival (start_time - check_in_time if positive)
    // 3. Total overtime (late_departure_minutes if positive)
    // 4. Total early departure (late_departure_minutes if negative)
    $query = "
        SELECT 
            e.employee_id,
            e.full_name,
            e.role,
            e.department,
            e.join_date,
            SUM(a.late_arrival_minutes) AS total_late_arrival,
            SUM(
                CASE WHEN a.check_in_time IS NOT NULL 
                      AND TIMESTAMPDIFF(MINUTE, a.check_in_time, CONCAT(s.shift_date, ' ', s.start_time)) > 0 
                     THEN TIMESTAMPDIFF(MINUTE, a.check_in_time, CONCAT(s.shift_date, ' ', s.start_time)) 
                     ELSE 0 
                END
            ) AS total_early_arrival,
            SUM(CASE WHEN a.late_departure_minutes > 0 THEN a.late_departure_minutes ELSE 0 END) AS total_overtime,
            SUM(CASE WHEN a.late_departure_minutes < 0 THEN ABS(a.late_departure_minutes) ELSE 0 END) AS total_early_departure,
            COUNT(DISTINCT s.shift_id) AS total_scheduled_shifts,
            COUNT(DISTINCT a.attendance_id) AS total_shifts_attended
        FROM employees e
        LEFT JOIN shifts s ON e.employee_id = s.employee_id AND s.shift_date <= CURDATE()
        LEFT JOIN attendance a ON s.shift_id = a.shift_id
        $where
        GROUP BY e.employee_id
        ORDER BY e.full_name ASC
    ";

    $sql = mysqli_query($con, $query);

    if (!$sql) {
        throw new Exception("Database query failed: " . mysqli_error($con));
    }

    $all_records = [];

    // Helper function to format minutes into H:M
    $format_minutes = function($minutes) {
        $is_negative = $minutes < 0;
        $abs_min = abs($minutes);
        $hours = floor($abs_min / 60);
        $mins = $abs_min % 60;
        $sign = $is_negative ? "-" : "";
        
        if ($hours > 0 && $mins > 0) {
            return "{$sign}{$hours}h {$mins}m";
        } elseif ($hours > 0) {
            return "{$sign}{$hours}h";
        } elseif ($mins > 0) {
            return "{$sign}{$mins}m";
        } else {
            return "0m";
        }
    };

    while ($row = mysqli_fetch_assoc($sql)) {
        $late_arrival = (int)$row['total_late_arrival'];
        $early_arrival = (int)$row['total_early_arrival'];
        $overtime = (int)$row['total_overtime'];
        $early_departure = (int)$row['total_early_departure'];

        // Balance = Earned Time (Early Arrival + Overtime) - Owed Time (Late Arrival + Early Departure)
        $balance_minutes = ($early_arrival + $overtime) - ($late_arrival + $early_departure);

        $absent_shifts = (int)$row['total_scheduled_shifts'] - (int)$row['total_shifts_attended'];
        if ($absent_shifts < 0) $absent_shifts = 0; // Just in case of data anomalies

        $all_records[] = [
            "employee_id" => (int)$row['employee_id'],
            "name" => $row['full_name'],
            "role" => $row['role'],
            "department" => $row['department'],
            "join_date" => $row['join_date'],
            "stats_minutes" => [
                "late_arrival" => $late_arrival,
                "early_arrival" => $early_arrival,
                "overtime" => $overtime,
                "early_departure" => $early_departure,
                "balance" => $balance_minutes
            ],
            "stats_formatted" => [
                "late_arrival" => $format_minutes($late_arrival),
                "early_arrival" => $format_minutes($early_arrival),
                "overtime" => $format_minutes($overtime),
                "early_departure" => $format_minutes($early_departure),
                "balance" => $format_minutes($balance_minutes)
            ],
            "attendance_counts" => [
                "total_scheduled" => (int)$row['total_scheduled_shifts'],
                "total_attended" => (int)$row['total_shifts_attended'],
                "total_absent" => $absent_shifts
            ]
        ];
    }

    // Apply Pagination
    $totalCount = count($all_records);
    $offset = ($page - 1) * $pageSize;
    $paginated_records = array_slice($all_records, $offset, $pageSize);

    echo json_encode([
        "success" => true,
        "totalCount" => $totalCount,
        "page" => $page,
        "pageSize" => $pageSize,
        "data" => $paginated_records
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>

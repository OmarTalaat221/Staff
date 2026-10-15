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

$employee_id = (int)($_GET['employee_id'] ?? $obj['employee_id'] ?? 0);

if ($employee_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Valid employee_id is required."
    ]);
    exit();
}

$response = new stdClass();

try {
    // We get the employee details first
    $emp_query = mysqli_query($con, "SELECT full_name, role, department FROM employees WHERE employee_id = '$employee_id'");
    if (mysqli_num_rows($emp_query) === 0) {
        throw new Exception("Employee not found.");
    }
    $employee = mysqli_fetch_assoc($emp_query);

    // Fetch rota statistics for this employee
    $query = "
        SELECT 
            s.rota_id,
            IFNULL(r.name, 'Independent Shifts') AS rota_name,
            MIN(s.shift_date) AS start_date,
            MAX(s.shift_date) AS end_date,
            
            SUM(CASE WHEN s.shift_date <= CURDATE() THEN a.late_arrival_minutes ELSE 0 END) AS total_late_arrival,
            
            SUM(
                CASE WHEN s.shift_date <= CURDATE() AND a.check_in_time IS NOT NULL 
                      AND TIMESTAMPDIFF(MINUTE, a.check_in_time, CONCAT(s.shift_date, ' ', s.start_time)) > 0 
                     THEN TIMESTAMPDIFF(MINUTE, a.check_in_time, CONCAT(s.shift_date, ' ', s.start_time)) 
                     ELSE 0 
                END
            ) AS total_early_arrival,
            
            SUM(CASE WHEN s.shift_date <= CURDATE() AND a.late_departure_minutes > 0 THEN a.late_departure_minutes ELSE 0 END) AS total_overtime,
            
            SUM(CASE WHEN s.shift_date <= CURDATE() AND a.late_departure_minutes < 0 THEN ABS(a.late_departure_minutes) ELSE 0 END) AS total_early_departure,
            
            COUNT(DISTINCT s.shift_id) AS total_scheduled_shifts,
            COUNT(DISTINCT CASE WHEN s.shift_date <= CURDATE() THEN s.shift_id END) AS total_past_shifts,
            COUNT(DISTINCT a.attendance_id) AS total_shifts_attended
            
        FROM shifts s
        LEFT JOIN rota_templates r ON s.rota_id = r.id
        LEFT JOIN attendance a ON s.shift_id = a.shift_id
        WHERE s.employee_id = '$employee_id'
        GROUP BY s.rota_id, r.name
        ORDER BY start_date DESC, end_date DESC
    ";

    $sql = mysqli_query($con, $query);

    if (!$sql) {
        throw new Exception("Database query failed: " . mysqli_error($con));
    }

    $rotas = [];

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

        $past_shifts = (int)$row['total_past_shifts'];
        $attended_shifts = (int)$row['total_shifts_attended'];
        $absent_shifts = $past_shifts - $attended_shifts;
        if ($absent_shifts < 0) $absent_shifts = 0; // Prevent negative absent shifts

        $rotas[] = [
            "rota_id" => $row['rota_id'] ? (int)$row['rota_id'] : null,
            "rota_name" => $row['rota_name'],
            "start_date" => $row['start_date'],
            "end_date" => $row['end_date'],
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
                "total_past" => $past_shifts,
                "total_attended" => $attended_shifts,
                "total_absent" => $absent_shifts
            ]
        ];
    }

    echo json_encode([
        "success" => true,
        "employee" => [
            "employee_id" => $employee_id,
            "name" => $employee['full_name'],
            "role" => $employee['role'],
            "department" => $employee['department']
        ],
        "rotas" => $rotas
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>

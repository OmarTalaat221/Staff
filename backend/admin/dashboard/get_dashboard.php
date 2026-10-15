<?php
include "../../db_con.php";

$response = new stdClass();
$today = date('Y-m-d');
$this_month = date('m');
$this_year = date('Y');

try {
    // 1. STATS
    // Total Staff
    $q_staff = mysqli_query($con, "SELECT COUNT(*) as count FROM employees");
    $total_staff = mysqli_fetch_assoc($q_staff)['count'] ?? 0;

    // Staff on shift today
    $q_shift = mysqli_query($con, "SELECT COUNT(DISTINCT employee_id) as count FROM shifts WHERE shift_date = '$today'");
    $on_shift_today = mysqli_fetch_assoc($q_shift)['count'] ?? 0;

    // Pending Leaves
    $q_leaves = mysqli_query($con, "SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'");
    $pending_leaves = mysqli_fetch_assoc($q_leaves)['count'] ?? 0;

    // Advance Requests
    $q_transfers = mysqli_query($con, "SELECT COUNT(*) as count FROM transfers WHERE status = 'Pending'");
    $advance_requests = mysqli_fetch_assoc($q_transfers)['count'] ?? 0;

    // Calculate percentage for shifts
    $shift_percentage = $total_staff > 0 ? round(($on_shift_today / $total_staff) * 100) : 0;
    
    // On leave today
    $q_on_leave = mysqli_query($con, "SELECT COUNT(DISTINCT employee_id) as count FROM leaves WHERE start_date <= '$today' AND end_date >= '$today' AND status = 'Approved'");
    $on_leave_today = $q_on_leave ? (mysqli_fetch_assoc($q_on_leave)['count'] ?? 0) : 0;
    $leave_percentage = $total_staff > 0 ? round(($on_leave_today / $total_staff) * 100) : 0;

    $pending_total = $pending_leaves + $advance_requests;
    $pending_percentage = $total_staff > 0 ? round(($pending_total / $total_staff) * 100) : 0;

    // 2. RECENT REQUESTS
    $recent_requests = [];
    $req_idx = 1;
    
    // Get recent leaves
    $q_recent_leaves = mysqli_query($con, "SELECT l.leave_id as id, e.full_name, l.status, l.created_at FROM leaves l JOIN employees e ON l.employee_id = e.employee_id ORDER BY l.created_at DESC LIMIT 3");
    if($q_recent_leaves) {
        while($row = mysqli_fetch_assoc($q_recent_leaves)) {
            $recent_requests[] = [
                "id" => $req_idx++,
                "name" => $row['full_name'],
                "type" => "Leave Request",
                "status" => $row['status'],
                "date" => date('Y-m-d', strtotime($row['created_at']))
            ];
        }
    }

    // Get recent transfers
    $q_recent_trans = mysqli_query($con, "SELECT t.transfer_id, e.full_name, t.status, t.created_at FROM transfers t JOIN employees e ON t.employee_id = e.employee_id ORDER BY t.created_at DESC LIMIT 3");
    if($q_recent_trans) {
        while($row = mysqli_fetch_assoc($q_recent_trans)) {
            $recent_requests[] = [
                "id" => $req_idx++,
                "name" => $row['full_name'],
                "type" => "Cash Advance",
                "status" => $row['status'],
                "date" => date('Y-m-d', strtotime($row['created_at']))
            ];
        }
    }
    
    // Sort combined requests by date descending
    usort($recent_requests, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    // Keep top 4
    $recent_requests = array_slice($recent_requests, 0, 4);

    // 3. EXPENSES TREND (Last 6 Months)
    $chart_expenses_trend = [];
    $months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for ($i = 5; $i >= 0; $i--) {
        $m = date('n', strtotime("-$i months"));
        $y = date('Y', strtotime("-$i months"));
        $m_name = $months_names[$m - 1];
        
        $q_exp = mysqli_query($con, "SELECT SUM(amount) as total FROM expenses WHERE MONTH(expense_date) = $m AND YEAR(expense_date) = $y");
        $month_exp = $q_exp ? (mysqli_fetch_assoc($q_exp)['total'] ?? 0) : 0;
        
        $chart_expenses_trend[] = [
            "month" => $m_name,
            "expenses" => (float)$month_exp,
            "active_staff" => $total_staff // Simplification: using current total staff
        ];
    }

    // 4. MOCK DATA FOR UNREAD MESSAGES (since there is no messages table yet)
    $unread_messages = [
        [
            "id" => 1,
            "name" => "Ahmed Hassan",
            "message" => "Can I swap my shift on Friday?",
            "time" => "10 min ago"
        ],
        [
            "id" => 2,
            "name" => "Sara Ali",
            "message" => "I submitted the advance request",
            "time" => "1 hour ago"
        ],
        [
            "id" => 3,
            "name" => "Mohamed Youssef",
            "message" => "Thank you for approving my leave",
            "time" => "3 hours ago"
        ]
    ];

    // Build Response
    $response->status = "success";
    $response->data = [
        "stats" => [
            "total_staff" => [
                "value" => (string)$total_staff,
                "change" => "Active Employees"
            ],
            "on_shift_today" => [
                "value" => (string)$on_shift_today,
                "change" => "$shift_percentage% attendance"
            ],
            "pending_leaves" => [
                "value" => (string)$pending_leaves,
                "change" => "Awaiting Approval"
            ],
            "advance_requests" => [
                "value" => (string)$advance_requests,
                "change" => "Awaiting Approval"
            ]
        ],
        "chart_expenses_trend" => $chart_expenses_trend,
        "staff_status_distribution" => [
            "on_shift" => [
                "count" => $on_shift_today,
                "percentage" => $shift_percentage
            ],
            "on_leave" => [
                "count" => $on_leave_today,
                "percentage" => $leave_percentage
            ],
            "pending_requests" => [
                "count" => $pending_total,
                "percentage" => $pending_percentage
            ]
        ],
        "recent_requests" => $recent_requests,
        "unread_messages" => $unread_messages
    ];

} catch (Exception $e) {
    $response->status = "error";
    $response->message = "Failed to fetch dashboard data: " . $e->getMessage();
}

echo json_encode($response);
?>

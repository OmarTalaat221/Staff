<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];

$response = new stdClass();

if (!$employee_id) {
    $response->status = "error";
    $response->message = 'Employee ID is required.';
    echo json_encode($response);
    exit;
}

// Fetch distinct months and years where the employee has shifts
$query = "SELECT DISTINCT MONTH(shift_date) as month, YEAR(shift_date) as year 
          FROM `shifts` 
          WHERE employee_id = '$employee_id' 
          ORDER BY year DESC, month DESC";

$sql = mysqli_query($con, $query);

if ($sql) {
    $months = array();
    while ($row = mysqli_fetch_assoc($sql)) {
        $m = (int)$row['month'];
        $y = (int)$row['year'];
        $dateObj = DateTime::createFromFormat('!m', $m);
        $monthName = $dateObj->format('F'); // Full month name

        $month_data = new stdClass();
        $month_data->month = $m;
        $month_data->year = $y;
        $month_data->label = $monthName . " " . $y;
        $months[] = $month_data;
    }
    $response->status = "success";
    $response->data = $months;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching available months.";
}

echo json_encode($response);
?>

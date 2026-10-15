<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'] ?? null;
$shift_id = $obj['shift_id'] ?? null;
$lat = $obj['lat'] ?? null;
$lng = $obj['lng'] ?? null;
$check_in_time = $obj['check_in_time'] ?? date("Y-m-d H:i:s");

$response = new stdClass();

if ($employee_id && $shift_id && $lat && $lng) {
    // Calculate distance to restaurant (Nour Maison)
    $restaurant_lat = 52.03860092163086;
    $restaurant_lng = -0.7721211910247803;
    
    
    // $restaurant_lat = 30.810400 ; 
    // $restaurant_lng =  30.997169 ;
    
    
    
    $earthRadius = 6371000; // in meters
    $latFrom = deg2rad(floatval($lat));
    $lonFrom = deg2rad(floatval($lng));
    $latTo = deg2rad($restaurant_lat);
    $lonTo = deg2rad($restaurant_lng);
    
    $latDelta = $latTo - $latFrom;
    $lonDelta = $lonTo - $lonFrom;
    
    $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
    $distance = $angle * $earthRadius;
    
    if ($distance > 50) {
        $response->status = "error";
        $response->message = "out of range";
    } else {
        // Check if already checked in for this shift
        $check_query = mysqli_query($con, "SELECT * FROM `attendance` WHERE `employee_id` = '$employee_id' AND `shift_id` = '$shift_id'");
        if (mysqli_num_rows($check_query) > 0) {
            $response->status = "error";
            $response->message = "You have already checked in for this shift.";
        } else {
            // Get shift start time
            $shift_query = mysqli_query($con, "SELECT * FROM `shifts` WHERE `shift_id` = '$shift_id'");
            $shift = mysqli_fetch_assoc($shift_query);
            
            if ($shift) {
                $scheduled_start = strtotime($shift['shift_date'] . ' ' . $shift['start_time']);
                $actual_check_in = strtotime($check_in_time);
                
                // Calculate late arrival in minutes
                $late_minutes = 0;
                if ($actual_check_in > $scheduled_start) {
                    $late_minutes = floor(($actual_check_in - $scheduled_start) / 60);
                }
                
                $sql = "INSERT INTO `attendance` (`employee_id`, `shift_id`, `check_in_time`, `check_in_lat`, `check_in_long`, `late_arrival_minutes`) 
                        VALUES ('$employee_id', '$shift_id', '$check_in_time', '$lat', '$lng', '$late_minutes')";
                
                if (mysqli_query($con, $sql)) {
                    $response->status = "success";
                    $response->message = "Check-in successful.";
                    $response->attendance_id = mysqli_insert_id($con);
                } else {
                    $response->status = "error";
                    $response->message = "Failed to record check-in: " . mysqli_error($con);
                }
            } else {
                $response->status = "error";
                $response->message = "Shift not found.";
            }
        }
    }
} else {
    $response->status = "error";
    $response->message = "Missing required parameters (employee_id, shift_id, lat, lng).";
}

echo json_encode($response);
?>

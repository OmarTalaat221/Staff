<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$attendance_id = $obj['attendance_id'] ?? null;
$lat = $obj['lat'] ?? null;
$lng = $obj['lng'] ?? null;
$check_out_time = $obj['check_out_time'] ?? date("Y-m-d H:i:s");

$response = new stdClass();

if ($attendance_id && $lat && $lng) {
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
        // Get attendance and shift info to calculate late departure
        $query = mysqli_query($con, "SELECT a.*, s.shift_date, s.end_time 
                                     FROM `attendance` a 
                                     JOIN `shifts` s ON a.shift_id = s.shift_id 
                                     WHERE a.attendance_id = '$attendance_id'");
        $data = mysqli_fetch_assoc($query);
        
        if ($data) {
            if ($data['check_out_time'] != null) {
                $response->status = "error";
                $response->message = "You have already checked out.";
            } else {
                $scheduled_end = strtotime($data['shift_date'] . ' ' . $data['end_time']);
                $actual_check_out = strtotime($check_out_time);
                
                // Calculate difference: 
                // positive means late departure (stayed after shift end)
                // negative means early departure (left before shift end)
                $diff_seconds = $actual_check_out - $scheduled_end;
                $late_departure_minutes = floor($diff_seconds / 60);
                
                $sql = "UPDATE `attendance` 
                        SET `check_out_time` = '$check_out_time', 
                            `check_out_lat` = '$lat', 
                            `check_out_long` = '$lng', 
                            `late_departure_minutes` = '$late_departure_minutes' 
                        WHERE `attendance_id` = '$attendance_id'";
                
                if (mysqli_query($con, $sql)) {
                    $response->status = "success";
                    $response->message = "Check-out successful.";
                } else {
                    $response->status = "error";
                    $response->message = "Failed to record check-out: " . mysqli_error($con);
                }
            }
        } else {
            $response->status = "error";
            $response->message = "Attendance record not found.";
        }
    }
} else {
    $response->status = "error";
    $response->message = "Missing required parameters (attendance_id, lat, lng).";
}

echo json_encode($response);
?>

<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$rota_id = $obj['rota_id'] ?? null;
$month = (int)($obj['month'] ?? date("m"));
$year = (int)($obj['year'] ?? date("Y"));
$data = $obj['data'] ?? null; // Expected: array of { employee_id, shifts: [...] }

$response = new stdClass();

if ($rota_id && is_array($data)) {
    mysqli_begin_transaction($con);

    try {
        $shifts_added = 0;
        $num_days_in_month = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        foreach ($data as $emp) {
            $employee_id = $emp['employee_id'];
            $shifts = $emp['shifts'];

            if (is_array($shifts)) {
                foreach ($shifts as $shift) {
                    $day = (int)$shift['day_number'];
                    $shift_type = $shift['shift_type'] ?? '';
                    $start_time = $shift['start_time'];
                    $end_time = $shift['end_time'];
                    $break_start = $shift['break_start'] ?? null;
                    $break_end = $shift['break_end'] ?? null;
                    $notes = $shift['notes'] ?? '';

                    // Save to Actual Shifts directly, mapping to rota_id
                    if ($day <= $num_days_in_month) {
                        $shift_date = sprintf('%04d-%02d-%02d', $year, $month, $day);
                        $sql_shift = "INSERT INTO `shifts` (`employee_id`, `rota_id`, `shift_date`, `shift_type`, `start_time`, `end_time`, `break_start`, `break_end`, `notes`) 
                                      VALUES ('$employee_id', '$rota_id', '$shift_date', '$shift_type', '$start_time', '$end_time', " . 
                                      ($break_start ? "'$break_start'" : "NULL") . ", " . 
                                      ($break_end ? "'$break_end'" : "NULL") . ", '$notes')";
                        
                        if(mysqli_query($con, $sql_shift)){
                            $shifts_added++;
                        }
                    }
                }
            }
        }

        mysqli_commit($con);
        $response->status = "success";
        $response->message = "Successfully added $shifts_added shifts to Rota #$rota_id.";

    } catch (Exception $e) {
        mysqli_rollback($con);
        $response->status = "error";
        $response->message = "Transaction failed: " . $e->getMessage();
    }
} else {
    $response->status = "error";
    $response->message = 'Invalid data provided. rota_id and data array are required.';
}

echo json_encode($response);
?>

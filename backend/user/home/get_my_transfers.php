<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$employee_id = $obj['employee_id'];

$response = new stdClass();
$transfers = array();

if ($employee_id) {
    $sql = mysqli_query($con, "SELECT * FROM `transfers` WHERE employee_id = '$employee_id' ORDER BY created_at DESC");
    
    if ($sql) {
        while ($row = mysqli_fetch_assoc($sql)) {
            $transfer = new stdClass();
            $transfer->id = (string)$row['transfer_id'];
            $transfer->type = $row['type'];
            $transfer->amount = (float)$row['amount'];
            $transfer->date = substr($row['created_at'], 0, 10);
            $transfer->time = substr($row['created_at'], 11, 5);
            $transfer->method = $row['method'];
            $transfer->note = $row['notes'];
                      
         if($row['attachment'] != '' || $row['attachment'] != NULL ){
             $attachment = 'https://camp-coding.site/nourstaff/'.$row['attachment'];
        $transfer->attachment = $attachment ;
        }
        
            // Map status to interface values
            $db_status = strtolower($row['status']);
            if ($db_status == 'completed') {
                $transfer->status = 'completed';
            } elseif ($db_status == 'cancelled') {
                $transfer->status = 'failed';
            } else {
                $transfer->status = 'pending';
            }
            
            $transfer->month = $row['transfer_month'];
            
            $transfers[] = $transfer;
        }
        $response->status = "success";
        $response->data = $transfers;
    } else {
        $response->status = "error";
        $response->message = "Failed to fetch transfers.";
    }
} else {
    $response->status = "error";
    $response->message = "Employee ID is required.";
}

echo json_encode($response);
?>

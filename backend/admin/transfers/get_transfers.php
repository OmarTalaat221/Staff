<?php
include "../../db_con.php";

$response = new stdClass();
$transfers = array();

$query = "SELECT t.*, e.full_name, e.role 
          FROM `transfers` t 
          JOIN `employees` e ON t.employee_id = e.employee_id 
          ORDER BY t.created_at DESC";

$sql = mysqli_query($con, $query);

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        if($row['attachment'] != '' || $row['attachment'] != NULL ){
             $attachment = 'https://camp-coding.site/nourstaff/'.$row['attachment'];
        $row['attachment'] = $attachment ;
        }
       
        $transfers[] = $row;
    }
    $response->status = "success";
    $response->data = $transfers;
} else {
    $response->status = "error";
    $response->message = "Failed to fetch transfers.";
}

echo json_encode($response);
?>

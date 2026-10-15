<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$name = $obj['name'] ?? null;

$response = new stdClass();

if ($name) {
    // Insert new Rota
    $sql = "INSERT INTO `rota_templates` (`name`) VALUES ('$name')";
    
    if (mysqli_query($con, $sql)) {
        $rota_id = mysqli_insert_id($con);
        
        $response->status = "success";
        $response->message = "Rota created successfully.";
        $response->rota_id = $rota_id;
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "Rota name is required.";
}

echo json_encode($response);
?>

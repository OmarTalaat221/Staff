<?php
include "../../db_con.php";

$response = new stdClass();
$templates = array();

$sql = mysqli_query($con, "SELECT * FROM `rota_templates` ORDER BY `id` DESC");

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        // Optionally count items
        $rota_id = $row['id'];
        $count_res = mysqli_query($con, "SELECT COUNT(*) as total FROM `shifts` WHERE `rota_id` = '$rota_id'");
        $count_row = mysqli_fetch_assoc($count_res);
        $row['items_count'] = $count_row['total'];
        
        $templates[] = $row;
    }
    $response->status = "success";
    $response->data = $templates;
} else {
    $response->status = "error";
    $response->message = "An error occurred while fetching templates.";
}

echo json_encode($response);
?>

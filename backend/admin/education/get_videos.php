<?php
include "../../db_con.php";

$response = new stdClass();
$videos = array();

$sql = mysqli_query($con, "SELECT v.*, c.category_name FROM `videos` v JOIN `education_categories` c ON v.category_id = c.category_id ORDER BY v.created_at DESC");

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $videos[] = $row;
    }
    $response->status = "success";
    $response->data = $videos;
} else {
    $response->status = "error";
    $response->message = "Failed to fetch videos.";
}

echo json_encode($response);
?>

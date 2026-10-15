<?php
include "../../db_con.php";

$response = new stdClass();
$categories = array();

$sql = mysqli_query($con, "SELECT * FROM `sop_categories` ORDER BY category_name ASC");

if ($sql) {
    while ($row = mysqli_fetch_assoc($sql)) {
        $categories[] = $row;
    }
    $response->status = "success";
    $response->data = $categories;
} else {
    $response->status = "error";
    $response->message = "Failed to fetch categories.";
}

echo json_encode($response);
?>

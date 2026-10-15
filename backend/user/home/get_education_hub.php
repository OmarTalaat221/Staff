<?php
include "../../db_con.php";

$response = new stdClass();
$hub_data = array();

// Fetch all categories
$cat_sql = mysqli_query($con, "SELECT * FROM `education_categories` ORDER BY category_name ASC");

if ($cat_sql) {
    while ($cat_row = mysqli_fetch_assoc($cat_sql)) {
        $cat_id = $cat_row['category_id'];
        
        $category = new stdClass();
        $category->id = $cat_id;
        $category->name = $cat_row['category_name'];
        $category->videos = array();
        
        // Fetch videos for this category
        $vid_sql = mysqli_query($con, "SELECT * FROM `videos` WHERE category_id = '$cat_id' ORDER BY created_at DESC");
        while ($vid_row = mysqli_fetch_assoc($vid_sql)) {
            $vid_row['is_featured'] = (bool)$vid_row['is_featured'];
            $category->videos[] = $vid_row;
        }
        
        $hub_data[] = $category;
    }
    $response->status = "success";
    $response->data = $hub_data;
} else {
    $response->status = "error";
    $response->message = "Failed to fetch Education Hub data.";
}

echo json_encode($response);
?>

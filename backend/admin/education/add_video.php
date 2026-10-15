<?php
include "../../db_con.php";
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$title = $obj['title'];
$category_id = $obj['category_id'];
$instructor = $obj['instructor'] ?? '';
$duration = $obj['duration'] ?? '';
$thumbnail_url = $obj['thumbnail_url'] ?? '';
$video_url = $obj['video_url'];
$description = $obj['description'] ?? '';
$is_featured = isset($obj['is_featured']) ? (int)$obj['is_featured'] : 0;

$response = new stdClass();

if ($title && $category_id && $video_url) {
    $sql = mysqli_query($con, "INSERT INTO `videos` (title, category_id, instructor, duration, thumbnail_url, video_url, description, is_featured) 
                               VALUES ('$title', '$category_id', '$instructor', '$duration', '$thumbnail_url', '$video_url', '$description', '$is_featured')");
    
    if ($sql) {
        $response->status = "success";
        $response->message = "Video added successfully.";
    } else {
        $response->status = "error";
        $response->message = "Failed to add video.";
    }
} else {
    $response->status = "error";
    $response->message = "Required fields are missing.";
}

echo json_encode($response);
?>

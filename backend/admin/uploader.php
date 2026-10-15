<?php
function uploadImage($base64, $upload_dir) {
    if (!$base64) return "";

    $dir = "../../" . $upload_dir;
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $image_parts = explode(";base64,", $base64);
    if (count($image_parts) < 2) return ""; // Not a valid base64 image

    $image_type_aux = explode("image/", $image_parts[0]);
    $image_type = $image_type_aux[1] ?? 'png';
    $image_base64_decode = base64_decode($image_parts[1]);

    $file_name = uniqid() . "." . $image_type;
    $file_path = $dir . $file_name;

    if (file_put_contents($file_path, $image_base64_decode)) {
        return $upload_dir . $file_name;
    }

    return "";
}
?>

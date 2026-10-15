<?php


header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, lang");


$host = "localhost";
$db_name = "campcod3_NourStaff";
$username = "campcod3_NourStaff";
$password = "NourStaff1231";

$con = mysqli_connect($host, $username, $password, $db_name);

if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}

mysqli_set_charset($con, "utf8");

// Set timezone to London, Europe
date_default_timezone_set('Europe/London');

// Sync MySQL session timezone with PHP's timezone offset (handles DST automatically)
$now = new DateTime("now", new DateTimeZone('Europe/London'));
$offset = $now->format('P');
mysqli_query($con, "SET time_zone = '$offset'");
 ?>

<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, lang");
// Source - https://stackoverflow.com/q/1053424
// Posted by Abs, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-08, License - CC BY-SA 4.0

error_reporting(E_ALL);
ini_set('display_errors', 1);


$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$response = new stdClass();

$pass = $data['pass'] ?? null;

if($pass == "1231"){
     $response->status = "success";
     $response->message = "Correct Password.";
}else{
     $response->status = "error";
     $response->message = "Wrong Pasword";
}


echo json_encode($response);
?>
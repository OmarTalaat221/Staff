<?php

include "../../db_con.php";

$json = file_get_contents('php://input');
$obj = json_decode($json, true);

$email = mysqli_real_escape_string($con, $obj['email']);
$password = mysqli_real_escape_string($con, $obj['password']);
$token = mysqli_real_escape_string($con, $obj['token']);

$response = new stdClass();

if (!empty($email) && !empty($password)) {

    $sql = mysqli_query($con, "
        SELECT * 
        FROM `employees` 
        WHERE `email` = '$email' 
        AND `password` = '$password' 
        AND `status` = 'Active'
    ");

    if (mysqli_num_rows($sql) > 0) {

        $user_data = mysqli_fetch_assoc($sql);

        $employee_id = $user_data['employee_id'];
        $old_token = $user_data['token'];

         if (empty($old_token) || $old_token != $token) {

            mysqli_query($con, "
                UPDATE `employees` 
                SET `token` = '$token' 
                WHERE `employee_id` = '$employee_id'
            ");

             $updated_sql = mysqli_query($con, "
                SELECT * 
                FROM `employees` 
                WHERE `employee_id` = '$employee_id'
            ");

            $user_data = mysqli_fetch_assoc($updated_sql);
        }

        $response->status = "success";
        $response->message = "Login successful.";
        $response->user = $user_data;

    } else {

        $response->status = "error";
        $response->message = "Invalid email or password, or account is inactive.";
    }

} else {

    $response->status = "error";
    $response->message = "Please provide both email and password.";
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

?>
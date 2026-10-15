<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$title = trim($data['title'] ?? '');
$type = ($data['type'] ?? '') === 'closing' ? 'closing' : 'opening';
$is_active = isset($data['is_active']) ? ((int)$data['is_active'] ? 1 : 0) : 1;
$items = is_array($data['items'] ?? null) ? $data['items'] : array();
$employee_ids = is_array($data['employee_ids'] ?? null) ? $data['employee_ids'] : array();

$response = new stdClass();

if ($title !== '') {
    $stmt = mysqli_prepare($con, "INSERT INTO `task_lists` (title, type, is_active) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "ssi", $title, $type, $is_active);

    if (mysqli_stmt_execute($stmt)) {
        $list_id = mysqli_insert_id($con);

        // Items
        $sort_order = 0;
        foreach ($items as $item) {
            $item_title = trim(is_array($item) ? ($item['title'] ?? '') : (string)$item);
            if ($item_title === '') {
                continue;
            }
            $stmt = mysqli_prepare($con, "INSERT INTO `task_list_items` (list_id, title, sort_order) VALUES (?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "isi", $list_id, $item_title, $sort_order);
            mysqli_stmt_execute($stmt);
            $sort_order++;
        }

        // Assigned employees
        foreach ($employee_ids as $employee_id) {
            $employee_id = (int)$employee_id;
            if ($employee_id) {
                mysqli_query($con, "INSERT IGNORE INTO `task_list_employees` (list_id, employee_id) VALUES ('$list_id', '$employee_id')");
            }
        }

        $response->status = "success";
        $response->message = "List added successfully.";
        $response->id = $list_id;
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "List title is required.";
}

echo json_encode($response);
?>

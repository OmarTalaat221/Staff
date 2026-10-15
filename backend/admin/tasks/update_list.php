<?php
include "../../db_con.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    $data = $_POST;
}

$id = (int)($data['id'] ?? 0);
$title = trim($data['title'] ?? '');
$type = ($data['type'] ?? '') === 'closing' ? 'closing' : 'opening';
$is_active = isset($data['is_active']) ? ((int)$data['is_active'] ? 1 : 0) : 1;
$items = is_array($data['items'] ?? null) ? $data['items'] : array();
$employee_ids = is_array($data['employee_ids'] ?? null) ? $data['employee_ids'] : array();

$response = new stdClass();

if ($id && $title !== '') {
    $stmt = mysqli_prepare($con, "UPDATE `task_lists` SET title = ?, type = ?, is_active = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ssii", $title, $type, $is_active, $id);

    if (mysqli_stmt_execute($stmt)) {
        // Items: update existing ones by id, add new ones, remove the rest
        // (existing items keep their id so previous checks are not lost)
        $keepIds = array();
        $sort_order = 0;
        foreach ($items as $item) {
            $item_id = (int)($item['id'] ?? 0);
            $item_title = trim($item['title'] ?? '');
            if ($item_title === '') {
                continue;
            }

            if ($item_id) {
                $stmt = mysqli_prepare($con, "UPDATE `task_list_items` SET title = ?, sort_order = ? WHERE id = ? AND list_id = ?");
                mysqli_stmt_bind_param($stmt, "siii", $item_title, $sort_order, $item_id, $id);
                mysqli_stmt_execute($stmt);
            } else {
                $stmt = mysqli_prepare($con, "INSERT INTO `task_list_items` (list_id, title, sort_order) VALUES (?, ?, ?)");
                mysqli_stmt_bind_param($stmt, "isi", $id, $item_title, $sort_order);
                mysqli_stmt_execute($stmt);
                $item_id = mysqli_insert_id($con);
            }

            $keepIds[] = $item_id;
            $sort_order++;
        }

        $deleteQuery = "DELETE FROM `task_list_items` WHERE list_id = '$id'";
        if (count($keepIds) > 0) {
            $deleteQuery .= " AND id NOT IN (" . implode(",", $keepIds) . ")";
        }
        mysqli_query($con, $deleteQuery);

        // Assigned employees
        mysqli_query($con, "DELETE FROM `task_list_employees` WHERE list_id = '$id'");
        foreach ($employee_ids as $employee_id) {
            $employee_id = (int)$employee_id;
            if ($employee_id) {
                mysqli_query($con, "INSERT IGNORE INTO `task_list_employees` (list_id, employee_id) VALUES ('$id', '$employee_id')");
            }
        }

        $response->status = "success";
        $response->message = "List updated successfully.";
    } else {
        $response->status = "error";
        $response->message = "Database error: " . mysqli_error($con);
    }
} else {
    $response->status = "error";
    $response->message = "List ID and title are required.";
}

echo json_encode($response);
?>

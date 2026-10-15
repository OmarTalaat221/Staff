-- Replaces the old per-log tasks (daily_tasks / attendance_tasks)
DROP TABLE IF EXISTS `attendance_tasks`;
DROP TABLE IF EXISTS `daily_tasks`;

-- Checklists: opening (start of shift) or closing (end of shift)
CREATE TABLE IF NOT EXISTS `task_lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` enum('opening','closing') NOT NULL DEFAULT 'opening',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Items inside each list
CREATE TABLE IF NOT EXISTS `task_list_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `list_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `list_id` (`list_id`),
  CONSTRAINT `fk_task_list_items_list` FOREIGN KEY (`list_id`) REFERENCES `task_lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Employees a list is assigned to (shows up on every shift)
CREATE TABLE IF NOT EXISTS `task_list_employees` (
  `list_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  PRIMARY KEY (`list_id`, `employee_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `fk_task_list_employees_list` FOREIGN KEY (`list_id`) REFERENCES `task_lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- An item checked by the employee during a shift (row exists = done)
CREATE TABLE IF NOT EXISTS `attendance_task_checks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attendance_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `done_at` datetime NOT NULL,
  `checked_by` int(11) DEFAULT NULL COMMENT 'employee_id of who checked the item',
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_item` (`attendance_id`, `item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `fk_task_checks_attendance` FOREIGN KEY (`attendance_id`) REFERENCES `attendance` (`attendance_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_checks_item` FOREIGN KEY (`item_id`) REFERENCES `task_list_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


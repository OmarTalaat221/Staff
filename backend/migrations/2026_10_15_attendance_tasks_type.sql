-- Opening / closing type for tasks attached to an attendance log
ALTER TABLE `attendance_tasks`
  ADD COLUMN `type` enum('opening','closing') NOT NULL DEFAULT 'opening' AFTER `task_id`,
  DROP INDEX `attendance_task`,
  ADD UNIQUE KEY `attendance_task` (`attendance_id`, `task_id`, `type`);

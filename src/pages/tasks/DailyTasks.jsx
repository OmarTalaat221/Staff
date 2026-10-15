import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Switch, Space, Popconfirm, Tooltip, Tag } from "antd";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getTasks, addTask, updateTask, deleteTask } from "../../features/Tasks/taskService";

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.status === "success") {
        setTasks(res.data || []);
      } else {
        toast.error(res?.message || "Failed to fetch tasks");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [tasks, searchText]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      is_active: Number(task.is_active ?? 1) === 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() || "",
        is_active: values.is_active ? 1 : 0,
      };
      const res = editingTask
        ? await updateTask({ ...payload, id: editingTask.id })
        : await addTask(payload);
      if (res?.status === "success") {
        toast.success(editingTask ? "Task updated successfully!" : "Task added successfully!");
        setModalOpen(false);
        fetchTasks();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    try {
      const res = await deleteTask(task.id);
      if (res?.status === "success") {
        toast.success("Task deleted successfully!");
        fetchTasks();
      } else {
        toast.error(res?.message || "Failed to delete task");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, i) => <span className="text-text/40 text-xs font-semibold">{i + 1}</span>,
    },
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (title) => <span className="font-bold text-text text-sm">{title}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (val) => <span className="text-text/60 text-xs">{val || "—"}</span>,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 110,
      render: (val) =>
        Number(val ?? 1) === 1 ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <button
              onClick={() => handleOpenEdit(record)}
              className="text-primary hover:text-primary/70 transition-colors cursor-pointer"
            >
              <Edit2 size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this task?"
              description="It will no longer be available when logging attendance."
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <button className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                <Trash2 size={16} />
              </button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Daily Tasks</h1>
          <p className="text-sm text-text/50 mt-1">
            Manage the checklist of tasks assigned to staff on clock in / clock out
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
          className="flex items-center gap-2 h-11 font-bold rounded-xl"
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="w-full md:w-72">
          <Input
            prefix={<Search size={16} className="text-text/30 mr-1" />}
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 700 }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            {editingTask ? <Edit2 size={18} /> : <Plus size={18} />}
            <span>{editingTask ? "Edit Task" : "Add Task"}</span>
          </div>
        }
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalOpen(false)}
        okText={editingTask ? "Save Changes" : "Add Task"}
        cancelText="Cancel"
        confirmLoading={saving}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="py-4">
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, whitespace: true, message: "Please enter task title!" }]}
          >
            <Input placeholder="e.g. Clean the kitchen" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional details" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

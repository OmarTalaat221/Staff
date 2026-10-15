import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Popconfirm, Tooltip, Tag, Segmented } from "antd";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { getTaskLists, addTaskList, updateTaskList, deleteTaskList } from "../../features/Tasks/taskService";
import { getAllStaff } from "../../features/Staff/staffService";

const TYPE_TAGS = {
  opening: { color: "green", label: "Opening" },
  closing: { color: "volcano", label: "Closing" },
};

export default function DailyTasks() {
  const [lists, setLists] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTaskLists();
      if (res?.status === "success") {
        setLists(res.data || []);
      } else {
        toast.error(res?.message || "Failed to fetch task lists");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load task lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
    getAllStaff()
      .then((res) => {
        if (res?.status === "success") setStaff(res.data || []);
      })
      .catch((e) => console.error("Failed to load staff", e));
  }, [fetchLists]);

  const filteredLists = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return lists.filter((l) => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (!q) return true;
      return (
        l.title?.toLowerCase().includes(q) ||
        (l.items || []).some((i) => i.title?.toLowerCase().includes(q))
      );
    });
  }, [lists, searchText, typeFilter]);

  const handleOpenAdd = () => {
    setEditingList(null);
    form.resetFields();
    form.setFieldsValue({ type: "opening", is_active: true, items: [{ title: "" }], employee_ids: [] });
    setModalOpen(true);
  };

  const handleOpenEdit = (list) => {
    setEditingList(list);
    form.setFieldsValue({
      title: list.title,
      type: list.type,
      is_active: Number(list.is_active ?? 1) === 1,
      items: (list.items || []).map((i) => ({ id: i.id, title: i.title })),
      employee_ids: (list.employees || []).map((e) => String(e.employee_id)),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        type: values.type,
        is_active: values.is_active ? 1 : 0,
        items: (values.items || [])
          .filter((i) => i?.title?.trim())
          .map((i) => ({ id: i.id, title: i.title.trim() })),
        employee_ids: values.employee_ids || [],
      };
      const res = editingList
        ? await updateTaskList({ ...payload, id: editingList.id })
        : await addTaskList(payload);
      if (res?.status === "success") {
        toast.success(editingList ? "List updated successfully!" : "List added successfully!");
        setModalOpen(false);
        fetchLists();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (list) => {
    try {
      const res = await deleteTaskList(list.id);
      if (res?.status === "success") {
        toast.success("List deleted successfully!");
        fetchLists();
      } else {
        toast.error(res?.message || "Failed to delete list");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "List",
      dataIndex: "title",
      key: "title",
      render: (title) => <span className="font-bold text-text text-sm">{title}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (type) => {
        const cfg = TYPE_TAGS[type] || TYPE_TAGS.opening;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items = []) =>
        items.length ? (
          <Tooltip
            title={
              <ul className="list-disc pl-4">
                {items.map((i) => (
                  <li key={i.id}>{i.title}</li>
                ))}
              </ul>
            }
          >
            <span className="text-text/70 text-xs font-semibold cursor-default">
              {items.length} item{items.length > 1 ? "s" : ""}
            </span>
          </Tooltip>
        ) : (
          <span className="text-text/30 text-xs">—</span>
        ),
    },
    {
      title: "Assigned Staff",
      dataIndex: "employees",
      key: "employees",
      render: (employees = []) =>
        employees.length ? (
          <div className="flex flex-wrap gap-1">
            {employees.map((e) => (
              <Tag key={e.employee_id} className="m-0">
                {e.full_name}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-text/30 text-xs">Not assigned</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (val) => (Number(val ?? 1) === 1 ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
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
              title="Delete this list?"
              description="Its items and all their checks will be removed."
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
            Opening and closing checklists assigned to staff on every shift
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
          className="flex items-center gap-2 h-11 font-bold rounded-xl"
        >
          Add List
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="w-full md:w-72">
          <Input
            prefix={<Search size={16} className="text-text/30 mr-1" />}
            placeholder="Search lists or items..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10 rounded-xl"
          />
        </div>
        <Segmented
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Opening", value: "opening" },
            { label: "Closing", value: "closing" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredLists}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            {editingList ? <Edit2 size={18} /> : <Plus size={18} />}
            <span>{editingList ? "Edit List" : "Add List"}</span>
          </div>
        }
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalOpen(false)}
        okText={editingList ? "Save Changes" : "Add List"}
        cancelText="Cancel"
        confirmLoading={saving}
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="py-4">
          <Form.Item
            name="title"
            label="List Title"
            rules={[{ required: true, whitespace: true, message: "Please enter list title!" }]}
          >
            <Input placeholder="e.g. Kitchen Opening" className="h-11 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Segmented
                block
                options={[
                  { label: "Opening", value: "opening" },
                  { label: "Closing", value: "closing" },
                ]}
              />
            </Form.Item>

            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item name="employee_ids" label="Assigned Staff">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select staff members"
              optionFilterProp="label"
              options={staff.map((s) => ({ value: String(s.employee_id), label: s.full_name }))}
            />
          </Form.Item>

          <div className="font-semibold text-text mb-2">Items</div>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-2">
                {fields.map(({ key, name }, index) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-text/40 font-semibold w-5">{index + 1}.</span>
                    <Form.Item name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[name, "title"]} noStyle>
                      <Input placeholder="Item" className="h-10 rounded-xl flex-1" />
                    </Form.Item>
                    <button
                      type="button"
                      onClick={() => remove(name)}
                      className="text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  block
                  icon={<Plus size={14} />}
                  onClick={() => add({ title: "" })}
                  className="rounded-xl"
                >
                  Add Item
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

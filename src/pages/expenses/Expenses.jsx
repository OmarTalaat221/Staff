import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Space, Popconfirm, Tooltip, Card } from "antd";
import { Plus, Edit2, Trash2, Search, DollarSign, Calendar, FileText, TrendingUp, X } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../../features/Expenses/expenseService";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-text/10">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}12` }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black text-text tracking-tight">{value}</p>
      <p className="text-xs text-text/50 font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

export default function Expenses() {
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await getExpenses();
      if (response && response.status === "success") {
        setExpenses(response.data || []);
      } else {
        toast.error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const totalCount = expenses.length;
    const totalAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const average = totalCount > 0 ? totalAmount / totalCount : 0;

    const currentMonthStr = dayjs().format("YYYY-MM");
    const thisMonthAmount = expenses
      .filter((item) => (item.expense_month || item.expense_date?.slice(0, 7)) === currentMonthStr)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    return {
      totalCount,
      totalAmount: totalAmount.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      average: average.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      thisMonthAmount: thisMonthAmount.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    };
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.notes || "").toLowerCase().includes(searchText.toLowerCase());

      const matchesMonth =
        !selectedMonth ||
        (item.expense_month || item.expense_date?.slice(0, 7)) === selectedMonth.format("YYYY-MM");

      return matchesSearch && matchesMonth;
    });
  }, [expenses, searchText, selectedMonth]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({
      expense_date: dayjs(),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingExpense(record);
    form.setFieldsValue({
      title: record.title,
      amount: parseFloat(record.amount),
      expense_date: dayjs(record.expense_date),
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const payload = {
        title: values.title,
        amount: values.amount.toString(),
        expense_date: values.expense_date.format("YYYY-MM-DD"),
        notes: values.notes || "",
      };

      let response;
      if (editingExpense) {
        payload.id = Number(editingExpense.id);
        response = await updateExpense(payload);
      } else {
        response = await addExpense(payload);
      }

      if (response && response.status === "success") {
        toast.success(editingExpense ? "Expense updated successfully!" : "Expense added successfully!");
        setModalOpen(false);
        fetchExpenses();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteExpense(Number(record.id));
      if (response && response.status === "success") {
        toast.success("Expense deleted successfully!");
        fetchExpenses();
      } else {
        toast.error(response?.message || "Failed to delete expense");
      }
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const hasActiveFilters = searchText || selectedMonth;

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedMonth(null);
  };

  const columns = [
    {
      title: "Title / Description",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <p className="font-bold text-text text-sm">{text}</p>
          {record.notes && <p className="text-xs text-text/50 mt-0.5">{record.notes}</p>}
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (amount) => (
        <span className="font-black text-primary text-sm">
          {parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 0 })} EGP
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "expense_date",
      key: "expense_date",
      width: 140,
      render: (date) => (
        <span className="text-text/70 text-xs font-semibold">
          {dayjs(date).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date) => (
        <span className="text-text/40 text-[10px] font-medium">
          {dayjs(date).format("DD-MM-YYYY HH:mm")}
        </span>
      ),
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
              title="Delete this expense?"
              description="Are you sure you want to delete this transaction?"
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
          <h1 className="text-xl font-bold text-text">Expenses Management</h1>
          <p className="text-sm text-text/50 mt-1">
            Track, update, and manage company operations expenses
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
          className="flex items-center gap-2 h-11 font-bold rounded-xl"
        >
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Expenses (All Time)"
          value={`${stats.totalAmount} EGP`}
          color="#22c55e"
        />
        <StatCard
          icon={TrendingUp}
          label="This Month Expenses"
          value={`${stats.thisMonthAmount} EGP`}
          color="#3b82f6"
        />
        <StatCard
          icon={Calendar}
          label="Average Expense Size"
          value={`${stats.average} EGP`}
          color="#8b5cf6"
        />
        <StatCard
          icon={FileText}
          label="Total Transactions"
          value={`${stats.totalCount}`}
          color="#f59e0b"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full md:w-72 relative">
            <Input
              prefix={<Search size={16} className="text-text/30 mr-1" />}
              placeholder="Search expenses by title or notes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          <DatePicker
            picker="month"
            placeholder="Filter by month"
            value={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            className="h-10 rounded-xl w-full sm:w-44"
          />

          {hasActiveFilters && (
            <Button
              type="text"
              onClick={handleClearFilters}
              icon={<X size={14} />}
              className="flex items-center gap-1.5 text-xs font-semibold text-text/50 hover:text-text"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: "px-6 py-4 border-t border-border",
          }}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <DollarSign size={18} />
            <span>{editingExpense ? "Edit Expense Transaction" : "Add New Expense"}</span>
          </div>
        }
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        confirmLoading={submitLoading}
        okText={editingExpense ? "Save Changes" : "Add Expense"}
        cancelText="Cancel"
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="py-4 space-y-4"
        >
          <Form.Item
            name="title"
            label="Expense Title"
            rules={[{ required: true, message: "Please input expense title!" }]}
          >
            <Input placeholder="e.g. صيانة تكييفات" className="h-11 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="amount"
              label="Amount (EGP)"
              rules={[{ required: true, message: "Please input amount!" }]}
            >
              <InputNumber
                min={0}
                className="w-full h-11 flex items-center rounded-xl font-bold"
                placeholder="0.00"
                precision={2}
              />
            </Form.Item>

            <Form.Item
              name="expense_date"
              label="Expense Date"
              rules={[{ required: true, message: "Please select date!" }]}
            >
              <DatePicker className="w-full h-11 rounded-xl" format="YYYY-MM-DD" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <Input.TextArea rows={3} placeholder="Notes, spare parts details, etc..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

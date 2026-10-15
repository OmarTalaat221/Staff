import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Space, Popconfirm, Tooltip, Card, Select } from "antd";
import { Plus, Edit2, Trash2, Search, PoundSterling, Calendar, FileText, TrendingUp, X } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseReasons } from "../../features/Expenses/expenseService";

dayjs.extend(customParseFormat);

export const getExpenseMonthStr = (item) => {
  if (!item) return "";
  if (item.expense_date) {
    const raw = String(item.expense_date).trim();
    const d = dayjs(raw, ["YYYY-MM-DD", "YYYY/MM/DD", "DD-MM-YYYY", "DD - MM - YYYY"]);
    if (d.isValid()) return d.format("YYYY-MM");
    const match = raw.match(/(\d{4})[-/](\d{1,2})/);
    if (match) return `${match[1]}-${match[2].padStart(2, "0")}`;
    const matchDMY = raw.match(/(\d{1,2})\D*(\d{1,2})\D*(\d{4})/);
    if (matchDMY) return `${matchDMY[3]}-${matchDMY[2].padStart(2, "0")}`;
  }
  if (item.expense_month && String(item.expense_month).includes("-")) {
    const parts = String(item.expense_month).split("-");
    if (parts.length === 2) return `${parts[0]}-${parts[1].padStart(2, "0")}`;
  }
  if (item.expense_month) {
    const mm = String(item.expense_month).padStart(2, "0");
    if (item.created_at) {
      const year = dayjs(item.created_at).format("YYYY");
      return `${year}-${mm}`;
    }
  }
  if (item.created_at) {
    const d = dayjs(item.created_at);
    if (d.isValid()) return d.format("YYYY-MM");
  }
  return "";
};

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

const SUPPLIERS = [
  "Brakes",
  "Waterdene",
  "Holdsworth",
  "Keser",
  "Tom Hixsons",
  "Fresho",
  "Simit and eggs",
  "Capital",
  "Delice de France",
  "Cheltern food group",
  "Next day coffee",
];

const PAYMENT_METHODS = [
  { label: "Cash", value: "Cash" },
  { label: "Bank Transfer", value: "Bank Transfer" },
];

export default function Expenses() {
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [expenseTitles, setExpenseTitles] = useState([]);
  const selectedTitle = Form.useWatch('title', form);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedTitleFilter, setSelectedTitleFilter] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Fetch expenses and reasons in parallel
      const [expensesResponse, reasonsResponse] = await Promise.allSettled([
        getExpenses(),
        getExpenseReasons()
      ]);

      let data = [];
      if (expensesResponse.status === "fulfilled" && expensesResponse.value && expensesResponse.value.status === "success") {
        data = expensesResponse.value.data || [];
        setExpenses(data);
      } else {
        toast.error("Failed to fetch expenses");
      }

      let reasons = [];
      if (reasonsResponse.status === "fulfilled" && Array.isArray(reasonsResponse.value)) {
        reasons = reasonsResponse.value;
      } else {
        console.warn("Failed to fetch expense reasons", reasonsResponse.reason);
      }

      setExpenseTitles(reasons);
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
      .filter((item) => getExpenseMonthStr(item) === currentMonthStr)
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
    const targetMonth = selectedMonth ? selectedMonth.format("YYYY-MM") : null;

    return expenses.filter((item) => {
      const matchesSearch =
        !searchText ||
        (item.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.notes || "").toLowerCase().includes(searchText.toLowerCase());

      const matchesMonth = !targetMonth || getExpenseMonthStr(item) === targetMonth;
      const matchesTitle = !selectedTitleFilter || (item.title === selectedTitleFilter);
      const matchesPaymentMethod = !selectedPaymentMethod || (item.payment_method === selectedPaymentMethod);

      return matchesSearch && matchesMonth && matchesTitle && matchesPaymentMethod;
    });
  }, [expenses, searchText, selectedMonth, selectedTitleFilter, selectedPaymentMethod]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({
      // default to first day of current month/year as selects
      expense_month: String(dayjs().month() + 1).padStart(2, '0'),
      expense_year: String(dayjs().year()),
      title: undefined,
      custom_title: undefined,
      notes: undefined,
      payment_method: undefined,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingExpense(record);
    let month = String(dayjs().month() + 1).padStart(2, '0');
    let year = String(dayjs().year());
    const monthStr = getExpenseMonthStr(record);
    if (monthStr && monthStr.includes('-')) {
      const [y, m] = monthStr.split('-');
      year = y;
      month = m;
    }

    form.setFieldsValue({
      title: record.title,
      amount: parseFloat(record.amount),
      expense_month: month,
      expense_year: year,
      notes: record.notes,
      payment_method: record.payment_method,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      let titleValue = values.title;
      if (Array.isArray(titleValue)) titleValue = titleValue[0];

      // compose ISO expense_date as 'YYYY-MM-01'
      const month = String(values.expense_month).padStart(2, '0');
      const year = String(values.expense_year);
      const expenseDateISO = `${year}-${month}-01`;

      const payload = {
        title: titleValue,
        amount: values.amount.toString(),
        expense_date: expenseDateISO,
        expense_month: month,
        notes: values.notes || "",
        payment_method: values.payment_method || "",
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

  const hasActiveFilters = searchText || selectedMonth || selectedTitleFilter || selectedPaymentMethod;

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedMonth(null);
    setSelectedTitleFilter(null);
    setSelectedPaymentMethod(null);
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
          {parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 0 })} Pound
        </span>
      ),
    },
    {
      title: "Payment Month",
      dataIndex: "expense_date",
      key: "expense_date",
      width: 140,
      render: (_, record) => {
        const out = getExpenseMonthStr(record);
        return <span className="text-text/70 text-xs font-semibold">{out || "—"}</span>;
      },
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 140,
      render: (val) => val ? (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${val === "Cash" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          {val}
        </span>
      ) : <span className="text-text/30 text-xs">—</span>,
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
          icon={PoundSterling}
          label="Total Expenses (All Time)"
          value={`${stats.totalAmount} Pound`}
          color="#22c55e"
        />
        <StatCard
          icon={TrendingUp}
          label="This Month Expenses"
          value={`${stats.thisMonthAmount} Pound`}
          color="#3b82f6"
        />
        <StatCard
          icon={Calendar}
          label="Average Expense Size"
          value={`${stats.average} Pound`}
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
            format="YYYY-MM"
            allowClear
            className="h-10 rounded-xl w-full sm:w-44"
            inputReadOnly
          />

          <div className="w-full md:w-64">
            <Select
              placeholder="Filter by title"
              allowClear
              value={selectedTitleFilter}
              onChange={(val) => setSelectedTitleFilter(val)}
              options={expenseTitles.map((t) => ({ label: t, value: t }))}
              className="h-10 rounded-xl w-full"
              showSearch
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              placeholder="Filter by payment"
              allowClear
              value={selectedPaymentMethod}
              onChange={(val) => setSelectedPaymentMethod(val)}
              options={PAYMENT_METHODS}
              className="h-10 rounded-xl w-full"
            />
          </div>

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
            <PoundSterling size={18} />
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
            rules={[{ required: true, message: "Please select expense title!" }]}
          >
            <Select
              showSearch
              placeholder="Select expense title..."
              className="w-full h-11 rounded-xl"
              options={expenseTitles.map((t) => ({ label: t, value: t }))}
              allowClear
              onChange={() => form.setFieldValue('notes', undefined)}
            />
          </Form.Item>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="amount"
              label="Amount (Pound)"
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
              name="expense_month"
              label="Month"
              rules={[{ required: true, message: "Please select month!" }]}
            >
              <Select className="w-full h-11 rounded-xl" options={Array.from({ length: 12 }).map((_, i) => {
                const m = String(i + 1).padStart(2, '0');
                return { label: m, value: m };
              })} />
            </Form.Item>

            <Form.Item
              name="expense_year"
              label="Year"
              rules={[{ required: true, message: "Please select year!" }]}
            >
              <Select
                className="w-full h-11 rounded-xl"
                options={(() => {
                  const current = dayjs().year();
                  const list = [];
                  for (let y = current - 2; y <= current + 2; y++) list.push({ label: String(y), value: String(y) });
                  return list.reverse();
                })()}
              />
            </Form.Item>
          </div>

          {selectedTitle === "Suppliers" ? (
            <Form.Item
              name="notes"
              label="Supplier"
              rules={[{ required: true, message: "Please select a supplier!" }]}
            >
              <Select
                showSearch
                placeholder="Select supplier..."
                className="w-full h-11 rounded-xl"
                options={SUPPLIERS.map((s) => ({ label: s, value: s }))}
                allowClear
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <Input.TextArea rows={3} placeholder="Notes, spare parts details, etc..." className="rounded-xl" />
            </Form.Item>
          )}

          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: "Please select payment method!" }]}
          >
            <Select
              placeholder="Select payment method..."
              className="w-full h-11 rounded-xl"
              options={PAYMENT_METHODS}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

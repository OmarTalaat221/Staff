import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Space, Popconfirm, Tooltip, Card, Select } from "antd";
import { Plus, Edit2, Trash2, Search, DollarSign, Calendar, FileText, TrendingUp, X } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../../features/Expenses/expenseService";

// default expense titles to show before/alongside API and saved values
const DEFAULT_EXPENSE_TITLES = [
  "صيانة تكييفات",
  "قطع غيار",
  "أجور عامل",
  "Office Supplies",
  "Transportation",
];

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
  const [expenseTitles, setExpenseTitles] = useState([]);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedTitleFilter, setSelectedTitleFilter] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await getExpenses();
      if (response && response.status === "success") {
        const data = response.data || [];
        setExpenses(data);

        // extract unique titles from API data and merge with defaults + saved
        try {
          const apiTitles = Array.from(
            new Set(data.map((it) => (it && it.title ? String(it.title).trim() : null)).filter(Boolean))
          );

          const rawSaved = localStorage.getItem('expense_titles');
          const saved = rawSaved ? JSON.parse(rawSaved) : [];

          const merged = Array.from(new Set([...DEFAULT_EXPENSE_TITLES, ...(Array.isArray(saved) ? saved : []), ...apiTitles]));
          setExpenseTitles(merged);
          try {
            localStorage.setItem('expense_titles', JSON.stringify(merged));
          } catch (e) {
            console.error('Failed to persist merged expense titles', e);
          }
        } catch (e) {
          console.error('Failed to merge expense titles from API', e);
        }
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

  useEffect(() => {
    // load saved expense titles from localStorage and include defaults
    try {
      const raw = localStorage.getItem('expense_titles');
      const list = raw ? JSON.parse(raw) : [];
      const merged = Array.from(new Set([...(Array.isArray(list) ? list : []), ...DEFAULT_EXPENSE_TITLES]));
      setExpenseTitles(merged);
      // ensure stored value contains merged list
      try {
        localStorage.setItem('expense_titles', JSON.stringify(merged));
      } catch (e) {
        /* ignore */
      }
    } catch (e) {
      console.error('Failed to load expense titles', e);
    }
  }, []);

  const saveExpenseTitle = (title) => {
    if (!title) return;
    const t = String(title).trim();
    if (!t) return;
    setExpenseTitles((prev) => {
      if (prev.includes(t)) return prev;
      const next = [t, ...prev].slice(0, 100);
      try {
        localStorage.setItem('expense_titles', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save expense titles', e);
      }
      return next;
    });
  };

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

      const matchesTitle = !selectedTitleFilter || (item.title === selectedTitleFilter);

      return matchesSearch && matchesMonth && matchesTitle;
    });
  }, [expenses, searchText, selectedMonth, selectedTitleFilter]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({
      // default to first day of current month/year as selects
      expense_month: String(dayjs().month() + 1).padStart(2, '0'),
      expense_year: String(dayjs().year()),
      title: undefined,
      custom_title: undefined,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingExpense(record);
    // if title exists in known titles, set it; otherwise use Other + custom_title
    const known = expenseTitles.includes(record.title);
    // parse existing expense_date to month/year if possible
    let month = String(dayjs().month() + 1).padStart(2, '0');
    let year = String(dayjs().year());
    if (record.expense_date) {
      try {
        const d = dayjs(record.expense_date, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD - MM - YYYY', 'DD - MM - YYYY']);
        if (d.isValid()) {
          month = String(d.month() + 1).padStart(2, '0');
          year = String(d.year());
        } else {
          const m = String(record.expense_date).match(/(\d{1,2})\D*(\d{1,2})\D*(\d{4})/);
          if (m) {
            // m[1]=day m[2]=month m[3]=year
            month = String(m[2]).padStart(2, '0');
            year = String(m[3]);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    form.setFieldsValue({
      title: known ? record.title : "__other__",
      // custom_title: known ? undefined : record.title,
      amount: parseFloat(record.amount),
      expense_month: month,
      expense_year: year,
      notes: record.notes,
    });
    if (record.title && known) saveExpenseTitle(record.title);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      // determine title from select or custom field and persist locally
      let titleValue = values.title;
      if (titleValue === "__other__") titleValue = values.title;
      if (Array.isArray(titleValue)) titleValue = titleValue[0];
      if (titleValue) saveExpenseTitle(titleValue);

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

  const hasActiveFilters = searchText || selectedMonth || selectedTitleFilter;

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedMonth(null);
    setSelectedTitleFilter(null);
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
      render: (date) => {
        let out = "";
        try {
          const d = dayjs(date, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD - MM - YYYY', 'DD - MM - YYYY']);
          if (d.isValid()) out = d.format('DD-MM-YYYY');
          else {
            const m = String(date).match(/(\d{1,2})\D*(\d{1,2})\D*(\d{4})/);
            if (m) out = `${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}-${m[3]}`;
            else out = String(date);
          }
        } catch (e) {
          out = String(date || "");
        }

        return <span className="text-text/70 text-xs font-semibold">{out}</span>;
      },
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
            rules={[{ required: true, message: "Please select or enter expense title!" }]}
          >
            <Select
              showSearch
              placeholder="e.g. صيانة تكييفات"
              className="w-full h-11 rounded-xl"
              options={[
                ...expenseTitles.map((t) => ({ label: t, value: t })),
                { label: "Other (write manually)", value: "__other__" },
              ]}
              onChange={(val) => {
                if (val && val !== "__other__") saveExpenseTitle(val);
              }}
              onBlur={() => {
                const v = form.getFieldValue('title');
                if (v && v !== "__other__") saveExpenseTitle(v);
              }}
              allowClear
            />
          </Form.Item>

          {/* Custom title input when user selects Other */}
            {/* <Form.Item
              name="custom_title"
              label="Custom Title"
              rules={[{ required: true, message: "Please enter custom title" }]}
            >
              <Input placeholder="Type custom expense title..." className="h-11 rounded-xl" />
            </Form.Item> */}
          

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

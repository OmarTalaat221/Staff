import React from "react";
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Input, Space, Popconfirm, Tooltip } from "antd";
import { Plus, Edit2, Trash2, Search, Calendar, User, Clock, CheckCircle2, XCircle, ArrowUpRight, ShieldAlert, Timer, Play, Power, X, UserCheck } from "lucide-react";
import dayjs from "dayjs";
import useAttendance from "./useAttendance";

const { Option } = Select;

// Beautiful StatCard component styled identically to key pages (Expenses, Leave)
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-text/10">
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

// Initials Avatar Helper
const InitialsAvatar = ({ name }) => {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: "#84B067" }}
    >
      {letters.toUpperCase()}
    </div>
  );
};

// Custom Status Badge
const AttendanceStatusBadge = ({ status }) => {
  const configs = {
    present: { text: "Present", style: "bg-success/10 text-success border-success/20" },
    late: { text: "Late", style: "bg-warning/10 text-warning border-warning/20" },
    absent: { text: "Absent", style: "bg-danger/10 text-danger border-danger/20" },
    "on-leave": { text: "On Leave", style: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  };

  const config = configs[status] || { text: status, style: "bg-text/10 text-text/70 border-text/20" };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${config.style}`}>
      {config.text}
    </span>
  );
};

export default function Attendance() {
  const {
    records,
    totalCount,
    page,
    setPage,
    pageSize,
    stats,
    liveTime,
    staffList,
    shifts,
    departments,
    roles,

    // Clock widget
    selectedStaffId,
    setSelectedStaffId,
    selectedStaff,
    selectedShift,
    setSelectedShift,
    todayRecordForSelected,
    workedLiveTime,
    handleClockIn,
    handleClockOut,

    // Filters
    searchText,
    setSearchText,
    period,
    setPeriod,
    selectedDate,
    setSelectedDate,
    department,
    setDepartment,
    role,
    setRole,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    handleClearFilters,

    // Modals
    addModalOpen,
    setAddModalOpen,
    handleOpenAdd,
    handleConfirmAdd,
    editModalOpen,
    setEditModalOpen,
    editingRecord,
    handleOpenEdit,
    handleConfirmEdit,
    handleDeleteRecord,
  } = useAttendance();

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Columns for the table
  const columns = [
    {
      title: "Staff Member",
      key: "staff",
      fixed: "left",
      width: 220,
      render: (_, r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <InitialsAvatar name={r.staffName} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text truncate leading-tight">{r.staffName}</p>
            <p className="text-xs text-text/50 truncate mt-0.5 leading-none">
              {r.staffRole} · {r.department}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 140,
      render: (v) => <span className="text-sm text-text font-semibold">{dayjs(v).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Shift Name",
      dataIndex: "shiftName",
      key: "shift",
      width: 120,
      render: (v) => <span className="text-sm text-text/70 font-medium">{v || "—"}</span>,
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      width: 110,
      render: (v) => (
        <span className={`text-sm font-semibold ${v ? "text-success font-bold" : "text-text/30"}`}>
          {v || "—"}
        </span>
      ),
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      width: 110,
      render: (v) => (
        <span className={`text-sm font-semibold ${v ? "text-danger font-bold" : "text-text/30"}`}>
          {v || "—"}
        </span>
      ),
    },
    {
      title: "Hours Worked",
      dataIndex: "workedMinutes",
      key: "worked",
      width: 140,
      render: (mins, r) => {
        if (r.status === "present" && !r.checkOut) {
          return (
            <span className="text-xs bg-success/5 border border-success/15 text-success font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              On Duty
            </span>
          );
        }
        if (!mins || mins <= 0) return <span className="text-sm text-text/30">—</span>;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return <span className="text-sm text-text font-bold">{h}h {m}m</span>;
      },
    },
    {
      title: "Late",
      dataIndex: "lateMinutes",
      key: "late",
      width: 100,
      render: (v) => (
        <span className={`text-sm font-bold ${v > 0 ? "text-warning" : "text-text/30"}`}>
          {v > 0 ? `${v}m` : "—"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v) => <AttendanceStatusBadge status={v} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Log">
            <button
              onClick={() => {
                handleOpenEdit(record);
                editForm.setFieldsValue({
                  shiftName: record.shiftName || "Morning",
                  checkIn: record.checkIn ? dayjs(record.checkIn, "HH:mm") : null,
                  checkOut: record.checkOut ? dayjs(record.checkOut, "HH:mm") : null,
                  lateMinutes: record.lateMinutes || 0,
                  status: record.status,
                });
              }}
              className="text-primary hover:text-primary/70 transition-colors cursor-pointer"
            >
              <Edit2 size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete Log">
            <Popconfirm
              title="Delete attendance log?"
              description="Are you sure you want to delete this attendance record?"
              onConfirm={() => handleDeleteRecord(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <button className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                <Trash2 size={16} />
              </button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title="View Profile">
            <a
              href={`/staff/${record.staffId}`}
              className="text-text/40 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowUpRight size={16} />
            </a>
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
          <h1 className="text-text text-2xl font-bold">Attendance & Clock Console</h1>
          <p className="text-text/60 text-sm mt-1">
            Track daily staff working hours, handle clock-in/out console, and edit shift records.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            handleOpenAdd();
            addForm.resetFields();
            addForm.setFieldsValue({
              date: dayjs(),
              shiftName: "Morning",
              status: "present",
              lateMinutes: 0,
            });
          }}
          className="flex items-center gap-2 h-11 font-bold rounded-xl"
        >
          Add Log Manually
        </Button>
      </div>

      {/* Interactive Live Clock Console Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Widget: Live Animated Clock */}
        <div className="lg:col-span-1 bg-text text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Background Decorative Rings */}
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
          <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full border border-white/10 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">
                Live Time Clock
              </span>
            </div>

            {/* Digital Clock */}
            <div className="mt-4">
              <h2 className="text-4xl font-black tracking-tight leading-none text-white font-mono">
                {liveTime.format("HH:mm:ss")}
              </h2>
              <p className="text-xs text-white/60 font-semibold mt-2">
                {liveTime.format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>

          {/* Active status pulse info for selected staff */}
          <div className="border-t border-white/10 pt-4 mt-6">
            {todayRecordForSelected ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Status for {selectedStaff.name}:</span>
                  <span className="text-primary font-bold flex items-center gap-1 uppercase tracking-wider text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                    Clocked In
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <Clock size={12} className="text-white/40" />
                    <span>In at {todayRecordForSelected.checkIn}</span>
                  </div>
                  {workedLiveTime && (
                    <div className="text-xs font-bold text-white flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      <Timer size={12} className="text-primary animate-spin" style={{ animationDuration: "6s" }} />
                      <span>{workedLiveTime}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Status for {selectedStaff.name}:</span>
                <span className="text-white/40 font-bold uppercase tracking-wider text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                  Not Clocked In
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Widget: Live Clocking Controller */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Power size={18} className="text-primary" />
              <h3 className="text-text font-bold text-base leading-none">Clock In / Clock Out Station</h3>
            </div>
            <p className="text-text/50 text-xs mt-1.5">
              Select a staff member and their shift, then perform real-time clock-in or clock-out.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-[11px] font-bold text-text/50 uppercase tracking-wide block mb-1.5">
                Staff Member
              </label>
              <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Select a staff member"
                optionFilterProp="children"
                value={selectedStaffId}
                onChange={setSelectedStaffId}
                className="h-11 rounded-xl"
              >
                {staffList.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text/50 uppercase tracking-wide block mb-1.5">
                Target Shift
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Select shift"
                value={selectedShift}
                onChange={setSelectedShift}
                disabled={!!todayRecordForSelected} // Lock shift once clocked in
                className="h-11 rounded-xl"
              >
                {shifts.map((s) => (
                  <Option key={s.name} value={s.name}>
                    {s.name} ({s.start} - {s.end})
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 sm:mt-8">
            <Button
              type="primary"
              disabled={!!todayRecordForSelected && !!todayRecordForSelected.checkIn}
              onClick={() => handleClockIn(selectedStaffId, selectedShift)}
              className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 text-white bg-success hover:bg-success/80 border-none cursor-pointer"
            >
              <Play size={16} />
              Clock In Staff
            </Button>

            <Button
              type="primary"
              danger
              disabled={!todayRecordForSelected || !!todayRecordForSelected.checkOut}
              onClick={() => handleClockOut(selectedStaffId)}
              className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Power size={16} />
              Clock Out Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          label="Present (Today)"
          value={stats.present}
          color="#16a34a"
        />
        <StatCard
          icon={Clock}
          label="Late Arrivals (Today)"
          value={stats.late}
          color="#d97706"
        />
        <StatCard
          icon={XCircle}
          label="Absent Today"
          value={stats.absent}
          color="#dc2626"
        />
        <StatCard
          icon={Timer}
          label="Average Shift worked"
          value={stats.averageHours}
          color="#84b067"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
        {/* Row 1: Period + Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-border overflow-hidden shrink-0">
            {[
              { key: "day", label: "Day" },
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setPeriod(opt.key);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  period === opt.key
                    ? "bg-primary text-white"
                    : "bg-surface text-text/60 hover:bg-bg"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <DatePicker
            picker={period === "day" ? "date" : period === "week" ? "week" : "month"}
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d || dayjs());
              setPage(1);
            }}
            allowClear={false}
            format={period === "day" ? "DD MMMM YYYY" : period === "week" ? "[Week of] DD MMM" : "MMMM YYYY"}
            className="h-10 rounded-xl w-full sm:w-48 font-semibold text-text"
          />
        </div>

        {/* Row 2: Search + Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <Input
              prefix={<Search size={15} className="text-text/30 mr-1" />}
              placeholder="Search staff by name..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          <Select
            placeholder="Department"
            value={department || undefined}
            onChange={(val) => {
              setDepartment(val || "");
              setPage(1);
            }}
            allowClear
            className="w-full sm:w-40 h-10 rounded-xl"
          >
            {departments.map((d) => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>

          <Select
            placeholder="Role"
            value={role || undefined}
            onChange={(val) => {
              setRole(val || "");
              setPage(1);
            }}
            allowClear
            className="w-full sm:w-36 h-10 rounded-xl"
          >
            {roles.map((r) => (
              <Option key={r} value={r}>{r}</Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter(val || "");
              setPage(1);
            }}
            allowClear
            className="w-full sm:w-36 h-10 rounded-xl"
          >
            <Option value="present">Present</Option>
            <Option value="late">Late</Option>
            <Option value="absent">Absent</Option>
            <Option value="on-leave">On Leave</Option>
          </Select>

          {hasActiveFilters && (
            <Button
              type="text"
              onClick={handleClearFilters}
              icon={<X size={14} />}
              className="flex items-center gap-1.5 text-xs font-semibold text-text/50 hover:text-text cursor-pointer"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Logs Table Grid */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <p className="text-text/50 text-sm font-semibold">No attendance logs found</p>
                <p className="text-text/30 text-xs mt-1">Try adjusting your filters or date picker selection</p>
              </div>
            ),
          }}
          rowClassName="hover:bg-bg/40 transition-colors"
        />

        {/* Custom Table Pagination Footer */}
        {totalCount > pageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg/10">
            <p className="text-xs text-text/50 font-semibold">
              Showing{" "}
              <span className="font-bold text-text">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-bold text-text">{totalCount}</span> logs
            </p>
            <div className="flex gap-1.5">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                size="small"
                className="rounded-lg text-xs font-bold cursor-pointer"
              >
                Previous
              </Button>
              <Button
                disabled={page * pageSize >= totalCount}
                onClick={() => setPage(page + 1)}
                size="small"
                className="rounded-lg text-xs font-bold cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Add Attendance Log Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <Plus size={18} />
            <span>Add Manual Attendance Log</span>
          </div>
        }
        open={addModalOpen}
        onOk={() => addForm.submit()}
        onCancel={() => setAddModalOpen(false)}
        okText="Create Log"
        cancelText="Cancel"
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleConfirmAdd}
          className="py-4 space-y-4"
        >
          <Form.Item
            name="staffId"
            label="Staff Member"
            rules={[{ required: true, message: "Please select a staff member!" }]}
          >
            <Select showSearch placeholder="Select a staff member" optionFilterProp="children" className="h-11 rounded-xl">
              {staffList.map((s) => (
                <Option key={s.id} value={s.id}>{s.name} ({s.role})</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="date"
              label="Log Date"
              rules={[{ required: true, message: "Please select date!" }]}
            >
              <DatePicker className="w-full h-11 rounded-xl" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="shiftName"
              label="Working Shift"
              rules={[{ required: true, message: "Please select shift!" }]}
            >
              <Select className="h-11 rounded-xl">
                {shifts.map((s) => (
                  <Option key={s.name} value={s.name}>{s.name} ({s.start} - {s.end})</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="checkIn" label="Check In Time">
              <TimePicker format="HH:mm" className="w-full h-11 rounded-xl" placeholder="HH:mm" />
            </Form.Item>

            <Form.Item name="checkOut" label="Check Out Time">
              <TimePicker format="HH:mm" className="w-full h-11 rounded-xl" placeholder="HH:mm" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label="Attendance Status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select className="h-11 rounded-xl">
                <Option value="present">Present</Option>
                <Option value="late">Late</Option>
                <Option value="absent">Absent</Option>
                <Option value="on-leave">On Leave</Option>
              </Select>
            </Form.Item>

            <Form.Item name="lateMinutes" label="Late Minutes">
              <Input type="number" min={0} className="h-11 rounded-xl font-semibold" placeholder="0" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Attendance Log Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <Edit2 size={18} />
            <span>Edit Attendance Log — {editingRecord?.staffName}</span>
          </div>
        }
        open={editModalOpen}
        onOk={() => editForm.submit()}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingRecord(null);
        }}
        okText="Save Changes"
        cancelText="Cancel"
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleConfirmEdit}
          className="py-4 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Date">
              <Input disabled value={editingRecord ? dayjs(editingRecord.date).format("DD MMM YYYY") : ""} className="h-11 rounded-xl" />
            </Form.Item>

            <Form.Item
              name="shiftName"
              label="Working Shift"
              rules={[{ required: true, message: "Please select shift!" }]}
            >
              <Select className="h-11 rounded-xl">
                {shifts.map((s) => (
                  <Option key={s.name} value={s.name}>{s.name} ({s.start} - {s.end})</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="checkIn" label="Check In Time">
              <TimePicker format="HH:mm" className="w-full h-11 rounded-xl" placeholder="HH:mm" />
            </Form.Item>

            <Form.Item name="checkOut" label="Check Out Time">
              <TimePicker format="HH:mm" className="w-full h-11 rounded-xl" placeholder="HH:mm" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label="Attendance Status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select className="h-11 rounded-xl">
                <Option value="present">Present</Option>
                <Option value="late">Late</Option>
                <Option value="absent">Absent</Option>
                <Option value="on-leave">On Leave</Option>
              </Select>
            </Form.Item>

            <Form.Item name="lateMinutes" label="Late Minutes">
              <Input type="number" min={0} className="h-11 rounded-xl font-semibold" placeholder="0" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

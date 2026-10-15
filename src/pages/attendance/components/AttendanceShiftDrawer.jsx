import React, { useEffect } from "react";
import { Drawer, Form, Select, Input, Button, Row, Col, TimePicker } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { addShift, updateShift } from "../../../features/Schedule/scheduleService";

const SHIFT_TYPES = [
  { key: "Morning", label: "Morning", time: "08:00 - 16:00", startTime: "08:00", endTime: "16:00" },
  { key: "Afternoon", label: "Afternoon", time: "14:00 - 22:00", startTime: "14:00", endTime: "22:00" },
  { key: "Evening", label: "Evening", time: "18:00 - 02:00", startTime: "18:00", endTime: "02:00" },
];

export default function AttendanceShiftDrawer({
  open,
  onClose,
  onSuccess,
  editShift,
  staffMembers = [],
  preSelectedDay,
  preSelectedStaffId,
  allDayNumbers = [],
  selectedMonth = dayjs(),
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!editShift;

  const currentYear = selectedMonth.year();
  const currentMonthNum = selectedMonth.month() + 1;

  useEffect(() => {
    if (open) {
      if (editShift) {
        let dayNum = editShift.day_number;
        if (!dayNum && editShift.shift_date) {
          dayNum = dayjs(editShift.shift_date).date();
        }
        form.setFieldsValue({
          day_number: Number(dayNum) || 1,
          shift_type: editShift.shift_type || "Morning",
          employee_id: String(editShift.employee_id),
          start_time: editShift.start_time ? dayjs(editShift.start_time, "HH:mm") : null,
          end_time: editShift.end_time ? dayjs(editShift.end_time, "HH:mm") : null,
          break_start: editShift.break_start ? dayjs(editShift.break_start, "HH:mm") : dayjs("12:00", "HH:mm"),
          break_end: editShift.break_end ? dayjs(editShift.break_end, "HH:mm") : dayjs("13:00", "HH:mm"),
          notes: editShift.notes || "",
        });
      } else {
        form.resetFields();
        if (preSelectedDay) {
          form.setFieldValue("day_number", Number(preSelectedDay));
        }
        if (preSelectedStaffId) {
          form.setFieldValue("employee_id", String(preSelectedStaffId));
        }
        form.setFieldsValue({
          shift_type: "Morning",
          start_time: dayjs("09:00", "HH:mm"),
          end_time: dayjs("17:00", "HH:mm"),
          break_start: dayjs("12:00", "HH:mm"),
          break_end: dayjs("13:00", "HH:mm"),
        });
      }
    }
  }, [open, editShift, form, preSelectedDay, preSelectedStaffId]);

  const handleShiftTypeChange = (value) => {
    const config = SHIFT_TYPES.find((t) => t.key === value);
    if (config) {
      form.setFieldValue("start_time", config.startTime ? dayjs(config.startTime, "HH:mm") : null);
      form.setFieldValue("end_time", config.endTime ? dayjs(config.endTime, "HH:mm") : null);
    }
  };

  const dayOptions = allDayNumbers.map((day) => ({
    value: day,
    label: `Day ${day} (${selectedMonth.date(day).format("ddd, DD MMM")})`,
  }));

  const staffOptions = staffMembers.map((s) => ({
    value: String(s.id),
    label: `${s.name} (${s.role || "Staff"})`,
  }));

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formatTime = (timeVal) => {
        if (!timeVal) return null;
        if (dayjs.isDayjs(timeVal)) return timeVal.format("HH:mm:ss");
        return timeVal;
      };

      const dayNum = values.day_number || 1;
      const shiftDate = `${currentYear}-${String(currentMonthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

      if (editShift) {
        const payload = {
          shift_id: Number(editShift.shift_id || editShift.id),
          employee_id: Number(values.employee_id || editShift.employee_id),
          shift_date: shiftDate,
          shift_type: values.shift_type || "Morning",
          start_time: formatTime(values.start_time) || editShift.start_time,
          end_time: formatTime(values.end_time) || editShift.end_time,
          break_start: formatTime(values.break_start) || editShift.break_start || "12:00:00",
          break_end: formatTime(values.break_end) || editShift.break_end || "13:00:00",
          notes: values.notes !== undefined ? values.notes : (editShift.notes || ""),
        };
        const res = await updateShift(payload);
        if (res && res.status === "success") {
          toast.success("Shift updated successfully");
          onSuccess?.();
          handleClose();
        } else {
          toast.error(res?.message || "Failed to update shift");
        }
      } else {
        const payload = {
          employee_id: Number(values.employee_id),
          shift_date: shiftDate,
          shift_type: values.shift_type || "Morning",
          start_time: formatTime(values.start_time),
          end_time: formatTime(values.end_time),
          break_start: formatTime(values.break_start) || "12:00:00",
          break_end: formatTime(values.break_end) || "13:00:00",
          notes: values.notes || "",
        };
        const res = await addShift(payload);
        if (res && res.status === "success") {
          toast.success("Shift added successfully");
          onSuccess?.();
          handleClose();
        } else {
          toast.error(res?.message || "Failed to add shift");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <span className="font-semibold text-text text-sm">
          {isEdit ? "Edit Shift / Attendance" : "Add Shift to Grid"}
        </span>
      }
      size={400}
      placement="right"
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={handleClose} size="small">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            size="small"
            className="font-bold"
          >
            {isEdit ? "Save Changes" : "Add Shift"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="small"
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="day_number"
              label="Day of Month"
              rules={[{ required: true, message: "Please select day" }]}
            >
              <Select placeholder="Select day" options={dayOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="employee_id"
          label="Staff Member"
          rules={[{ required: true, message: "Please select employee" }]}
        >
          <Select
            placeholder="Select staff"
            options={staffOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item name="shift_type" label="Shift Type">
          <Select
            placeholder="Select shift type"
            onChange={handleShiftTypeChange}
            options={SHIFT_TYPES.map((t) => ({ value: t.key, label: `${t.label} (${t.time})` }))}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" size="small" className="w-full" inputReadOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="end_time" label="End Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" size="small" className="w-full" inputReadOnly />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="break_start" label="Break Start">
              <TimePicker format="HH:mm" size="small" className="w-full" inputReadOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="break_end" label="Break End">
              <TimePicker format="HH:mm" size="small" className="w-full" inputReadOnly />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea rows={2} placeholder="Notes..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

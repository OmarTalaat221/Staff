import { useEffect } from "react";
import { Drawer, Form, Select, Input, Button, Row, Col } from "antd";

const SHIFT_TYPES = [
  { key: "Morning", label: "Morning", time: "06:00 - 14:00", startTime: "06:00", endTime: "14:00" },
  { key: "Afternoon", label: "Afternoon", time: "14:00 - 22:00", startTime: "14:00", endTime: "22:00" },
  { key: "Evening", label: "Evening", time: "22:00 - 06:00", startTime: "22:00", endTime: "06:00" },
];

export default function RotaShiftDrawer({
  open,
  onClose,
  onSubmit,
  editShift,
  loading,
  staffMembers,
  preSelectedDay,
  preSelectedStaffId,
  allDayNumbers
}) {
  const [form] = Form.useForm();
  const isEdit = !!editShift;

  useEffect(() => {
    if (open) {
      if (editShift) {
        form.setFieldsValue({
          day_number: Number(editShift.day_number),
          shift_type: editShift.shift_type,
          employee_id: String(editShift.employee_id),
          start_time: editShift.start_time,
          end_time: editShift.end_time,
          break_start: editShift.break_start || "12:00",
          break_end: editShift.break_end || "13:00",
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
          start_time: "09:00",
          end_time: "17:00",
          break_start: "12:00",
          break_end: "13:00",
        });
      }
    }
  }, [open, editShift, form, preSelectedDay, preSelectedStaffId]);

  const handleShiftTypeChange = (value) => {
    const config = SHIFT_TYPES.find((t) => t.key === value);
    if (config) {
      form.setFieldValue("start_time", config.startTime);
      form.setFieldValue("end_time", config.endTime);
    }
  };

  const dayOptions = allDayNumbers.map(day => ({
    value: day,
    label: `Day ${day}`
  }));

  const staffOptions = staffMembers.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.role}`,
  }));

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <span className="font-semibold text-text text-sm">
          {isEdit ? "Edit Rota Shift" : "Add Shift to Template"}
        </span>
      }
      width={400}
      placement="right"
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={handleClose} size="small">Cancel</Button>
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
        onFinish={onSubmit}
        requiredMark={false}
        size="small"
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="day_number"
              label="Day of Month"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select day" options={dayOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="employee_id"
          label="Staff Member"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select staff"
            options={staffOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="end_time" label="End Time" rules={[{ required: true }]}>
              <Input type="time" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="break_start" label="Break Start">
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="break_end" label="Break End">
              <Input type="time" />
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

import { useEffect } from "react";
import { Drawer, Form, Select, Input, Button, Row, Col } from "antd";

export default function ShiftDrawer({
  open,
  onClose,
  onSubmit,
  editShift,
  loading,
  weekDays,
  shiftTypes,
  staffMembers,
  preSelectedDate,
  preSelectedShiftType,
}) {
  const [form] = Form.useForm();
  const isEdit = !!editShift;

  useEffect(() => {
    if (open) {
      if (editShift) {
        form.setFieldsValue({
          date: editShift.date,
          shiftType: editShift.shiftType,
          staffId: editShift.staffId,
          startTime: editShift.startTime,
          endTime: editShift.endTime,
          breakMinutes: editShift.breakMinutes,
          notes: editShift.notes || "",
        });
      } else {
        form.resetFields();
        if (preSelectedDate) {
          form.setFieldValue("date", preSelectedDate);
        }
        if (preSelectedShiftType) {
          form.setFieldValue("shiftType", preSelectedShiftType);
          const config = shiftTypes.find((t) => t.key === preSelectedShiftType);
          if (config) {
            form.setFieldValue("startTime", config.startTime);
            form.setFieldValue("endTime", config.endTime);
          }
        }
        form.setFieldValue("breakMinutes", 30);
      }
    }
  }, [
    open,
    editShift,
    form,
    preSelectedDate,
    preSelectedShiftType,
    shiftTypes,
  ]);

  const handleShiftTypeChange = (value) => {
    const config = shiftTypes.find((t) => t.key === value);
    if (config) {
      form.setFieldValue("startTime", config.startTime);
      form.setFieldValue("endTime", config.endTime);
    }
  };

  const dateOptions = weekDays.map((d) => ({
    value: d.date,
    label: `${d.dayName}, ${d.monthName} ${d.dayNumber}${d.isToday ? " (Today)" : ""}`,
  }));

  const shiftTypeOptions = shiftTypes.map((t) => ({
    value: t.key,
    label: `${t.label} (${t.time})`,
  }));

  const staffOptions = staffMembers.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.role}`,
  }));

  const breakOptions = [
    { value: 0, label: "No break" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes" },
  ];

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <span className="font-semibold text-text">
          {isEdit ? "Edit Shift" : "Add New Shift"}
        </span>
      }
      width={480}
      placement="right"
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={handleClose} style={{ height: 44 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            style={{ height: 44 }}
          >
            {isEdit ? "Save Changes" : "Assign Shift"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Date is required" }]}
        >
          <Select placeholder="Select date" options={dateOptions} />
        </Form.Item>

        <Form.Item
          name="shiftType"
          label="Shift Type"
          rules={[{ required: true, message: "Shift type is required" }]}
        >
          <Select
            placeholder="Select shift type"
            options={shiftTypeOptions}
            onChange={handleShiftTypeChange}
          />
        </Form.Item>

        <Form.Item
          name="staffId"
          label="Staff Member"
          rules={[{ required: true, message: "Staff member is required" }]}
        >
          <Select
            placeholder="Select staff member"
            options={staffOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="End Time"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="breakMinutes" label="Break Duration">
          <Select options={breakOptions} />
        </Form.Item>

        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea
            rows={3}
            placeholder="Any special notes for this shift..."
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

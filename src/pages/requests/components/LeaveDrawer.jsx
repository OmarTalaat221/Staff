import { useEffect, useMemo } from "react";
import { Drawer, Form, Select, Input, Button, DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function LeaveDrawer({
  open,
  onClose,
  onSubmit,
  editLeave,
  loading,
  leaveTypes,
  staffMembers,
}) {
  const [form] = Form.useForm();
  const isEdit = !!editLeave;

  useEffect(() => {
    if (!open) return;

    if (editLeave) {
      form.setFieldsValue({
        staffId: editLeave.staffId,
        type: editLeave.type,
        dateRange: [dayjs(editLeave.startDate), dayjs(editLeave.endDate)],
        reason: editLeave.reason || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, editLeave, form]);

  const staffOptions = useMemo(
    () =>
      staffMembers.map((staff) => ({
        value: staff.id,
        label: `${staff.name} — ${staff.role}`,
      })),
    [staffMembers]
  );

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
          {isEdit ? "Edit Leave Request" : "New Leave Request"}
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
            {isEdit ? "Save Changes" : "Submit Request"}
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

        <Form.Item
          name="type"
          label="Leave Type"
          rules={[{ required: true, message: "Leave type is required" }]}
        >
          <Select placeholder="Select leave type" options={leaveTypes} />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Date Range"
          rules={[{ required: true, message: "Date range is required" }]}
        >
          <RangePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="reason" label="Reason">
          <Input.TextArea rows={4} placeholder="Reason for leave..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

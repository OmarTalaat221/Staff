import { useEffect, useMemo } from "react";
import {
  Drawer,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  DatePicker,
} from "antd";
import dayjs from "dayjs";

export default function TransferDrawer({
  open,
  onClose,
  onSubmit,
  editTransfer,
  loading,
  transferTypes,
  paymentMethods,
  staffMembers,
}) {
  const [form] = Form.useForm();
  const isEdit = !!editTransfer;

  useEffect(() => {
    if (!open) return;

    if (editTransfer) {
      form.setFieldsValue({
        staffId: editTransfer.staffId,
        type: editTransfer.type,
        amount: editTransfer.amount,
        method: editTransfer.method,
        month: dayjs(editTransfer.month),
        note: editTransfer.note || "",
      });
    } else {
      form.resetFields();
      form.setFieldValue("month", dayjs());
    }
  }, [open, editTransfer, form]);

  const staffOptions = useMemo(
    () =>
      staffMembers.map((staff) => ({
        value: staff.id,
        label: `${staff.name} — ${staff.role} (${new Intl.NumberFormat(
          "en-EG",
          {
            style: "currency",
            currency: "EGP",
            minimumFractionDigits: 0,
          }
        ).format(staff.salary)})`,
      })),
    [staffMembers]
  );

  const handleStaffChange = (staffId) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    const currentType = form.getFieldValue("type");

    if (staff && currentType === "salary") {
      form.setFieldValue("amount", staff.salary);
    }
  };

  const handleTypeChange = (type) => {
    const staffId = form.getFieldValue("staffId");
    const staff = staffMembers.find((s) => s.id === staffId);

    if (type === "salary" && staff) {
      form.setFieldValue("amount", staff.salary);
    }
  };

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
          {isEdit ? "Edit Transfer" : "New Transfer"}
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
            {isEdit ? "Save Changes" : "Create Transfer"}
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
            onChange={handleStaffChange}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Transfer Type"
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select
            placeholder="Select type"
            options={transferTypes}
            onChange={handleTypeChange}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (EGP)"
          rules={[
            { required: true, message: "Amount is required" },
            {
              type: "number",
              min: 1,
              message: "Amount must be greater than 0",
            },
          ]}
        >
          <InputNumber
            placeholder="Enter amount"
            className="w-full!"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="method"
          label="Payment Method"
          rules={[{ required: true, message: "Method is required" }]}
        >
          <Select placeholder="Select method" options={paymentMethods} />
        </Form.Item>

        <Form.Item
          name="month"
          label="Month"
          rules={[{ required: true, message: "Month is required" }]}
        >
          <DatePicker picker="month" className="w-full" format="YYYY-MM" />
        </Form.Item>

        <Form.Item name="note" label="Note (optional)">
          <Input.TextArea rows={3} placeholder="Additional notes..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

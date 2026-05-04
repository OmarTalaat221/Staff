import { useEffect, useMemo } from "react";
import { Drawer, Form, Select, Input, InputNumber, Button } from "antd";

export default function AdvanceDrawer({
  open,
  onClose,
  onSubmit,
  editAdvance,
  loading,
  repaymentMethods,
  staffMembers,
}) {
  const [form] = Form.useForm();
  const isEdit = !!editAdvance;

  useEffect(() => {
    if (!open) return;

    if (editAdvance) {
      form.setFieldsValue({
        staffId: editAdvance.staffId,
        amount: editAdvance.amount,
        repaymentMethod: editAdvance.repaymentMethod,
        reason: editAdvance.reason || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, editAdvance, form]);

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
          {isEdit ? "Edit Advance Request" : "New Advance Request"}
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
          name="amount"
          label="Amount (EGP)"
          rules={[
            { required: true, message: "Amount is required" },
            {
              type: "number",
              min: 100,
              message: "Minimum amount is 100 EGP",
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
          name="repaymentMethod"
          label="Repayment Method"
          rules={[{ required: true, message: "Repayment method is required" }]}
        >
          <Select
            placeholder="Select repayment method"
            options={repaymentMethods}
          />
        </Form.Item>

        <Form.Item name="reason" label="Reason">
          <Input.TextArea rows={4} placeholder="Reason for advance..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

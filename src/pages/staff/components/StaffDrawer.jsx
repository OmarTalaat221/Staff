import { memo, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
} from "antd";
import { ROLES, DEPARTMENTS, STATUSES } from "../useStaffPage";
import dayjs from "dayjs";

// Pre-compute options outside - never re-created
const roleOptions = ROLES.map((r) => ({ label: r, value: r }));
const departmentOptions = DEPARTMENTS.map((d) => ({ label: d, value: d }));
const statusOptions = STATUSES.map((s) => ({
  label: s === "on-leave" ? "On Leave" : s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}));

const StaffDrawer = memo(function StaffDrawer({
  open,
  mode,
  editingStaff,
  loading,
  onClose,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit && editingStaff) {
      form.setFieldsValue({
        ...editingStaff,
        joinDate: editingStaff.joinDate ? dayjs(editingStaff.joinDate) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "active" });
    }
  }, [open, isEdit, editingStaff, form]);

  const handleFinish = (values) => {
    onSubmit({
      ...values,
      joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
    });
  };

  return (
    <Drawer
      title={
        <span className="text-text text-lg font-semibold">
          {isEdit ? "Edit Staff Member" : "Add New Staff"}
        </span>
      }
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {isEdit ? "Save Changes" : "Add Staff"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={
            <span className="text-text text-sm font-medium">Full Name</span>
          }
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="email"
            label={<span className="text-text text-sm font-medium">Email</span>}
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="email@restaurant.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="text-text text-sm font-medium">Phone</span>}
            rules={[{ required: true, message: "Phone is required" }]}
          >
            <Input placeholder="+20 1XX XXX XXXX" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="role"
            label={<span className="text-text text-sm font-medium">Role</span>}
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select placeholder="Select role" options={roleOptions} />
          </Form.Item>

          <Form.Item
            name="department"
            label={
              <span className="text-text text-sm font-medium">Department</span>
            }
            rules={[{ required: true, message: "Department is required" }]}
          >
            <Select
              placeholder="Select department"
              options={departmentOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="joinDate"
            label={
              <span className="text-text text-sm font-medium">Join Date</span>
            }
            rules={[{ required: true, message: "Join date is required" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="salary"
            label={
              <span className="text-text text-sm font-medium">
                Salary (EGP)
              </span>
            }
            rules={[{ required: true, message: "Salary is required" }]}
          >
            <InputNumber
              className="w-full!"
              min={0}
              step={500}
              placeholder="0"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/,/g, "")}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label={<span className="text-text text-sm font-medium">Status</span>}
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select placeholder="Select status" options={statusOptions} />
        </Form.Item>
      </Form>
    </Drawer>
  );
});

export default StaffDrawer;

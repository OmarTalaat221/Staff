import { Drawer, Form, Input, Select, Button, Space } from "antd";
import { Plus, Trash2 } from "lucide-react";

export default function AddSOPDrawer({
  open,
  onClose,
  onSubmit,
  loading,
  categories,
  roles,
}) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      title={<span className="font-bold text-lg text-text">Add New Standard Operating Procedure (SOP)</span>}
      width={520}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={handleCancel} className="h-10 rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
            className="h-10 rounded-xl"
          >
            Create SOP
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        initialValues={{
          steps: [{ text: "" }],
        }}
      >
        <Form.Item
          name="title"
          label="SOP Title"
          rules={[{ required: true, message: "SOP title is required" }]}
        >
          <Input placeholder="e.g. Closing cash reconciliation" className="h-10 rounded-xl" />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
          rules={[{ required: true, message: "Category is required" }]}
        >
          <Select
            placeholder="Select Category"
            options={categories.map((c) => ({
              value: Number(c.category_id),
              label: c.category_name,
            }))}
            className="h-10 rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="roles"
          label="Applicable Roles"
          rules={[{ required: true, message: "At least one role is required" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select applicable roles"
            options={roles.map((r) => ({
              value: r.key,
              label: r.label,
            }))}
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item name="tips" label="Tips & Best Practices">
          <Input.TextArea
            rows={3}
            placeholder="e.g. Always check the cash register twice before closing."
            className="rounded-xl"
          />
        </Form.Item>

        {/* Dynamic Steps List */}
        <div className="border-t border-border mt-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-text text-sm">Procedure Steps</span>
          </div>

          <Form.List
            name="steps"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(new Error("At least one step is required"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    className="p-3 bg-bg rounded-xl border border-border relative group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-primary">Step {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={() => remove(field.name)}
                          className="h-6 w-6 flex items-center justify-center p-0"
                        />
                      )}
                    </div>

                    <Form.Item
                      {...field}
                      name={[field.name, "text"]}
                      rules={[{ required: true, message: "Step description is required" }]}
                      className="mb-2"
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="What needs to be done in this step?"
                        className="rounded-lg text-sm"
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, "note"]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="Additional note/warning (optional)"
                        className="rounded-lg text-xs"
                      />
                    </Form.Item>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<Plus size={16} />}
                  className="h-10 border-dashed border-primary/20 text-primary hover:border-primary font-medium rounded-xl bg-primary/5"
                >
                  Add Step
                </Button>
              </div>
            )}
          </Form.List>
        </div>
      </Form>
    </Drawer>
  );
}

import { Modal, Form, Input, Button } from "antd";

export default function AddCategoryModal({ open, onClose, onSubmit, loading }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values.name);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={<span className="font-bold text-lg text-text">Add New Category</span>}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} className="h-10 rounded-xl">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          className="h-10 rounded-xl"
        >
          Add Category
        </Button>,
      ]}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: "Category name is required" }]}
        >
          <Input placeholder="e.g. Cleaning, Barista, Security" className="h-10 rounded-xl" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

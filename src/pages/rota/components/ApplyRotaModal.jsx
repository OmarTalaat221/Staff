import { memo } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import dayjs from "dayjs";

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const years = Array.from({ length: 5 }, (_, i) => ({
  value: dayjs().year() + i,
  label: (dayjs().year() + i).toString(),
}));

const ApplyRotaModal = memo(function ApplyRotaModal({
  open,
  onClose,
  onApply,
  template,
  loading
}) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onApply(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text">Apply Rota Template</span>
          <span className="text-xs text-text/50 font-normal mt-0.5">
            Template: {template?.name}
          </span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="apply" 
          type="primary" 
          loading={loading}
          onClick={() => form.submit()}
        >
          Apply to Schedule
        </Button>
      ]}
      width={450}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          month: dayjs().month() + 1,
          year: dayjs().year(),
          new_rota_name: `Rota for ${dayjs().format('MMMM YYYY')}`
        }}
        className="mt-4"
      >
        <Form.Item
          name="new_rota_name"
          label="History Name"
          rules={[{ required: true, message: "Please enter a name for history" }]}
          extra="This name will be used to identify this action in the history."
        >
          <Input placeholder="e.g., July 2026 Schedule" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="month"
              label="Month"
              rules={[{ required: true }]}
            >
              <Select options={months} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="year"
              label="Year"
              rules={[{ required: true }]}
            >
              <Select options={years} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

export default ApplyRotaModal;

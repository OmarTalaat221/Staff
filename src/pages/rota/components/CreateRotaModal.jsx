import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Card, InputNumber, TimePicker, Divider } from 'antd';
import { Calendar, UserPlus, FileText, Plus, Trash2, Clock } from 'lucide-react';
import dayjs from 'dayjs';

export default function CreateRotaModal({ open, onClose, onCreate, loading, staffMembers }) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const date = values.date;
      
      const payload = {
        template_name: values.template_name,
        month: date.month() + 1,
        year: date.year(),
        data: (values.employees || []).map(emp => ({
          employee_id: emp.employee_id,
          shifts: (emp.shifts || []).map(s => ({
            day_number: s.day_number,
            shift_type: s.shift_type,
            start_time: s.times[0].format('HH:mm:ss'),
            end_time: s.times[1].format('HH:mm:ss'),
            break_start: s.break_times?.[0]?.format('HH:mm:ss') || null,
            break_end: s.break_times?.[1]?.format('HH:mm:ss') || null,
            notes: s.notes || ""
          }))
        }))
      };

      await onCreate(payload);
      form.resetFields();
    } catch (error) {
      console.error("Validation Error:", error);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-primary">
          <FileText size={20} />
          <span>Create New Rota Template</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Create Template"
      cancelText="Cancel"
      width={800}
      centered
      className="create-rota-modal"
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          employees: [{ employee_id: undefined, shifts: [] }]
        }}
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="template_name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter a template name' }]}
          >
            <Input 
              prefix={<FileText size={16} className="text-text/30" />} 
              placeholder="e.g. June 2026 Schedule" 
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Month & Year"
            rules={[{ required: true, message: 'Please select month and year' }]}
          >
            <DatePicker picker="month" className="w-full" />
          </Form.Item>
        </div>

        <Divider orientation="left" className="m-0 mb-4">
          <span className="text-xs font-bold text-text/40 uppercase tracking-wider">Staff & Shifts</span>
        </Divider>

        <Form.List name="employees">
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-4">
              {fields.map(({ key, name, ...restField }) => (
                <Card 
                  key={key} 
                  size="small" 
                  className="border-primary/10 bg-primary/5"
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Staff Member #{name + 1}</span>
                      {fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<Trash2 size={14} />} 
                          onClick={() => remove(name)}
                          size="small"
                        />
                      )}
                    </div>
                  }
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'employee_id']}
                    rules={[{ required: true, message: 'Select staff' }]}
                    className="mb-4"
                  >
                    <Select
                      showSearch
                      placeholder="Select Staff Member"
                      options={staffMembers.map(s => ({ label: s.name, value: s.id }))}
                      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />
                  </Form.Item>

                  <div className="bg-white/50 p-3 rounded-lg border border-dashed border-primary/20">
                    <Form.List name={[name, 'shifts']}>
                      {(shiftFields, { add: addShift, remove: removeShift }) => (
                        <div className="flex flex-col gap-2">
                          {shiftFields.map((shiftField) => (
                            <Space key={shiftField.key} align="start" className="flex flex-wrap items-end bg-white p-2 rounded shadow-sm">
                              <Form.Item
                                {...shiftField}
                                name={[shiftField.name, 'day_number']}
                                label={<span className="text-[10px]">Day</span>}
                                rules={[{ required: true }]}
                                className="mb-0"
                              >
                                <InputNumber min={1} max={31} size="small" style={{ width: 50 }} />
                              </Form.Item>
                              
                              <Form.Item
                                {...shiftField}
                                name={[shiftField.name, 'shift_type']}
                                label={<span className="text-[10px]">Type</span>}
                                rules={[{ required: true }]}
                                className="mb-0"
                              >
                                <Select size="small" style={{ width: 100 }}>
                                  <Select.Option value="Morning">Morning</Select.Option>
                                  <Select.Option value="Evening">Evening</Select.Option>
                                  <Select.Option value="Night">Night</Select.Option>
                                  <Select.Option value="Off">Off</Select.Option>
                                </Select>
                              </Form.Item>

                              <Form.Item
                                {...shiftField}
                                name={[shiftField.name, 'times']}
                                label={<span className="text-[10px]">Work Time</span>}
                                rules={[{ required: true }]}
                                className="mb-0"
                              >
                                <TimePicker.RangePicker format="HH:mm" size="small" style={{ width: 150 }} />
                              </Form.Item>

                              <Form.Item
                                {...shiftField}
                                name={[shiftField.name, 'break_times']}
                                label={<span className="text-[10px]">Break</span>}
                                className="mb-0"
                              >
                                <TimePicker.RangePicker format="HH:mm" size="small" style={{ width: 150 }} />
                              </Form.Item>

                              <Button 
                                type="text" 
                                danger 
                                icon={<Trash2 size={12} />} 
                                onClick={() => removeShift(shiftField.name)}
                                size="small"
                                className="mb-1"
                              />
                            </Space>
                          ))}
                          <Button 
                            type="dashed" 
                            onClick={() => addShift()} 
                            block 
                            icon={<Plus size={14} />}
                            size="small"
                            className="mt-2 text-primary border-primary/30"
                          >
                            Add Shift for this Staff
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                </Card>
              ))}
              <Button 
                type="primary" 
                onClick={() => add()} 
                block 
                icon={<Plus size={16} />}
                className="bg-primary/80 hover:bg-primary"
              >
                Add Another Staff Member
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

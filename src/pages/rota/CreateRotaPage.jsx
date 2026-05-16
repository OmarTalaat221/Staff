import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, Divider, Table, TimePicker, InputNumber, Popconfirm } from 'antd';
import { Calendar, FileText, Plus, Trash2, ArrowLeft, Save, UserPlus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { addRota } from '../../features/Schedule/scheduleService';
import { getAllStaff } from '../../features/Staff/staffService';
import Loader from '../../shared/components/loader';

export default function CreateRotaPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getAllStaff();
        if (res && (res.status === "success" || Array.isArray(res.data))) {
          const list = Array.isArray(res.data) ? res.data : [];
          setStaffList(list.map(s => ({
            label: s.full_name,
            value: String(s.employee_id)
          })));
        }
      } catch (error) {
        toast.error("Failed to load staff members");
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
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

      const res = await addRota(payload);
      if (res.status === "success") {
        toast.success("Rota template created successfully");
        navigate('/rota');
      } else {
        toast.error(res.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Please check the form for errors");
    } finally {
      setLoading(false);
    }
  };

  if (staffLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/rota')}
            className="flex items-center justify-center w-10 h-10 rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-black text-text">Create New Template</h1>
            <p className="text-sm text-text/50">Configure staff shifts for a specific month</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Save size={18} />}
          size="large"
          onClick={() => form.submit()}
          loading={loading}
          className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
        >
          Save Template
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
          employees: []
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden" title={
              <div className="flex items-center gap-2 text-primary">
                <FileText size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">General Info</span>
              </div>
            }>
              <Form.Item
                name="template_name"
                label="Template Name"
                rules={[{ required: true, message: 'Template name is required' }]}
              >
                <Input placeholder="e.g. Summer Rota 2026" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="date"
                label="Month & Year"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker picker="month" className="w-full h-12 rounded-lg" size="large" />
              </Form.Item>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-6">
                <div className="flex gap-3">
                  <Info size={20} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-primary/80 leading-relaxed font-medium">
                    Select staff members from the list and add their specific shifts.
                    You can add multiple shifts for the same staff on the same day.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Staff & Shifts */}
          <div className="lg:col-span-2">
            <Form.List name="employees">
              {(fields, { add, remove }) => (
                <div className="space-y-6">
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      className="rounded-2xl border-border shadow-sm overflow-hidden"
                      title={
                        <div className="flex items-center justify-between">
                          <Space size="middle">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                              {name + 1}
                            </div>
                            <Form.Item
                              {...restField}
                              name={[name, 'employee_id']}
                              rules={[{ required: true, message: 'Select staff' }]}
                              className="mb-0"
                            >
                              <Select
                                showSearch
                                placeholder="Choose Staff Member"
                                options={staffList}
                                size="large"
                                style={{ width: 250 }}
                                className="font-bold"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                              />
                            </Form.Item>
                          </Space>
                          <Popconfirm title="Remove this staff?" onConfirm={() => remove(name)}>
                            <Button danger type="text" icon={<Trash2 size={18} />} />
                          </Popconfirm>
                        </div>
                      }
                    >
                      <Form.List name={[name, 'shifts']}>
                        {(shiftFields, { add: addShift, remove: removeShift }) => (
                          <div className="space-y-3">
                            {shiftFields.length > 0 && (
                              <div className="grid grid-cols-12 gap-3 px-2 mb-1">
                                <div className="col-span-2 text-[10px] font-black text-text/30 uppercase">Day</div>
                                <div className="col-span-2 text-[10px] font-black text-text/30 uppercase">Type</div>
                                <div className="col-span-4 text-[10px] font-black text-text/30 uppercase">Work Hours</div>
                                <div className="col-span-3 text-[10px] font-black text-text/30 uppercase">Break</div>
                                <div className="col-span-1"></div>
                              </div>
                            )}

                            {shiftFields.map((shiftField) => (
                              <div key={shiftField.key} className="grid grid-cols-12 gap-3 p-3 bg-surface border border-border rounded-xl items-center hover:border-primary/30 transition-all group">
                                <div className="col-span-2">
                                  <Form.Item
                                    {...shiftField}
                                    name={[shiftField.name, 'day_number']}
                                    rules={[{ required: true }]}
                                    className="mb-0"
                                  >
                                    <InputNumber min={1} max={31} className="w-full font-bold h-10 flex items-center" />
                                  </Form.Item>
                                </div>
                                <div className="col-span-2">
                                  <Form.Item
                                    {...shiftField}
                                    name={[shiftField.name, 'shift_type']}
                                    rules={[{ required: true }]}
                                    className="mb-0"
                                  >
                                    <Select className="w-full h-10" placeholder="Type">
                                      <Select.Option value="Morning">Morning</Select.Option>
                                      <Select.Option value="Evening">Evening</Select.Option>
                                      <Select.Option value="Night">Night</Select.Option>
                                      <Select.Option value="Off">Off</Select.Option>
                                    </Select>
                                  </Form.Item>
                                </div>
                                <div className="col-span-4">
                                  <Form.Item
                                    {...shiftField}
                                    name={[shiftField.name, 'times']}
                                    rules={[{ required: true }]}
                                    className="mb-0"
                                  >
                                    <TimePicker.RangePicker format="HH:mm" className="w-full h-10" />
                                  </Form.Item>
                                </div>
                                <div className="col-span-3">
                                  <Form.Item
                                    {...shiftField}
                                    name={[shiftField.name, 'break_times']}
                                    className="mb-0"
                                  >
                                    <TimePicker.RangePicker format="HH:mm" className="w-full h-10" />
                                  </Form.Item>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <Button
                                    danger
                                    type="text"
                                    icon={<Trash2 size={14} />}
                                    onClick={() => removeShift(shiftField.name)}
                                    className="opacity-0 group-hover:opacity-100"
                                  />
                                </div>
                              </div>
                            ))}

                            <Button
                              type="dashed"
                              onClick={() => addShift()}
                              block
                              icon={<Plus size={16} />}
                              className="h-12 border-dashed border-primary/20 text-primary hover:border-primary font-bold rounded-xl bg-primary/5 mt-2"
                            >
                              Add Shift for this Staff
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Card>
                  ))}

                  {/* Empty State / Add Staff Trigger */}
                  <div className="flex flex-col items-center justify-center p-12 bg-surface border-2 border-dashed border-border rounded-3xl group hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => add()}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <UserPlus size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-text">Add Staff Member</h3>
                    <p className="text-sm text-text/40 text-center max-w-xs mt-1">
                      Click to select a staff member and start building their schedule
                    </p>
                  </div>
                </div>
              )}
            </Form.List>
          </div>
        </div>
      </Form>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-picker-range .ant-picker-active-bar { background: var(--primary) !important; }
        .ant-input-number-input { font-weight: 700; }
        .ant-form-item-label label { font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase; color: rgba(0,0,0,0.4); }
      `}} />
    </div>
  );
}

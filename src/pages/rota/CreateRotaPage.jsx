import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, Card, Space, Divider, Checkbox, Avatar } from 'antd';
import { ArrowLeft, Save, Info, Search, Users, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { createRota, assignEmployeesToRota } from '../../features/Schedule/scheduleService';
import { getAllStaff } from '../../features/Staff/staffService';
import Loader from '../../shared/components/loader';

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function CreateRotaPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getAllStaff();
        if (res && (res.status === "success" || Array.isArray(res.data))) {
          const list = Array.isArray(res.data) ? res.data : [];
          setStaffList(list);
        }
      } catch (error) {
        toast.error("Failed to load staff members");
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    const defaultDate = dayjs();
    const arabicMonth = ARABIC_MONTHS[defaultDate.month()];
    const year = defaultDate.year();
    form.setFieldsValue({
      date: defaultDate,
      name: `روته شهر ${arabicMonth} ${year}`
    });
  }, [form]);

  const handleDateChange = (date) => {
    if (date) {
      const arabicMonth = ARABIC_MONTHS[date.month()];
      const year = date.year();
      form.setFieldsValue({
        name: `روته شهر ${arabicMonth} ${year}`
      });
    }
  };

  const filteredStaff = staffList.filter(s =>
    (s.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (s.role || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggleStaff = (id) => {
    const stringId = String(id);
    setSelectedStaffIds(prev =>
      prev.includes(stringId)
        ? prev.filter(item => item !== stringId)
        : [...prev, stringId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStaffIds(filteredStaff.map(s => String(s.employee_id)));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const onFinish = async (values) => {
    if (selectedStaffIds.length === 0) {
      toast.error("Please select at least one staff member");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create the Rota
      const createRes = await createRota(values.name);
      if (createRes.status === "success" && createRes.rota_id) {
        const newRotaId = createRes.rota_id;

        // Step 2: Assign Selected Employees
        const assignRes = await assignEmployeesToRota(newRotaId, selectedStaffIds.map(Number));
        if (assignRes.status === "success") {
          toast.success("Rota created & staff assigned successfully!");
          navigate('/rota');
        } else {
          toast.error(assignRes.message || "Failed to assign staff to Rota");
        }
      } else {
        toast.error(createRes.message || "Failed to create Rota");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (staffLoading) return <Loader />;

  const isAllFilteredSelected = filteredStaff.length > 0 && filteredStaff.every(s => selectedStaffIds.includes(String(s.employee_id)));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/rota')}
            className="flex items-center justify-center w-10 h-10 rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-black text-text">Create Rota Plan</h1>
            <p className="text-sm text-text/50">Create a rota plan and assign staff members</p>
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
          Save Plan
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: General Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card
              className="rounded-2xl border-border shadow-sm overflow-hidden"
              title={
                <div className="flex items-center gap-2 text-primary">
                  <FileText size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">General Info</span>
                </div>
              }
            >
              <Form.Item
                name="date"
                label="Select Month & Year"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker
                  picker="month"
                  className="w-full h-12 rounded-lg"
                  size="large"
                  onChange={handleDateChange}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label="Rota Name"
                rules={[{ required: true, message: 'Rota name is required' }]}
              >
                <Input placeholder="e.g. روته شهر أغسطس 2026" size="large" className="rounded-lg h-12 font-bold" />
              </Form.Item>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-6">
                <div className="flex gap-3">
                  <Info size={20} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-primary/80 leading-relaxed font-medium">
                    This will create an empty rota template. You can easily add and manage employee shifts directly inside the rota details table afterward.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Assign Staff Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="rounded-2xl border-border shadow-sm overflow-hidden"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Users size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Assign Staff ({selectedStaffIds.length})</span>
                  </div>
                  {filteredStaff.length > 0 && (
                    <Checkbox
                      checked={isAllFilteredSelected}
                      indeterminate={selectedStaffIds.length > 0 && !isAllFilteredSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="text-xs font-bold text-text/60"
                    >
                      Select All
                    </Checkbox>
                  )}
                </div>
              }
            >
              <div className="space-y-4">
                {/* Search Bar */}
                <Input
                  prefix={<Search size={16} className="text-text/30 mr-1" />}
                  placeholder="Search staff by name or role..."
                  size="large"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-xl h-11"
                />

                <Divider className="my-2" />

                {/* Staff Selection List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => {
                      const isSelected = selectedStaffIds.includes(String(staff.employee_id));
                      return (
                        <div
                          key={staff.employee_id}
                          onClick={() => handleToggleStaff(staff.employee_id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-primary/5 border-primary shadow-sm'
                              : 'bg-surface border-border hover:border-text/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="bg-primary/10 text-primary font-bold text-sm"
                              size={40}
                            >
                              {(staff.full_name || 'S').charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-bold text-text leading-tight">
                                {staff.full_name}
                              </h4>
                              <p className="text-[11px] font-semibold text-text/40 uppercase tracking-wider mt-0.5">
                                {staff.role || 'No Role'}
                              </p>
                            </div>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleStaff(staff.employee_id)}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-text/30 font-medium">
                      No staff members found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}

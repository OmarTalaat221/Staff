import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Avatar, Tooltip, Button, Space, Card, Tag, Popconfirm, Modal, InputNumber, Checkbox, Divider, Input, Drawer, Form, TimePicker, Select, Radio } from "antd";
import { Clock, Coffee, Info, ChevronLeft, ChevronRight, ArrowLeft, Calendar, DollarSign, Plus, Edit2, Trash2, UserPlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getRotaDetails, addShift, updateShift, deleteShift, updateRotaEmployeeSalary, assignEmployeesToRota, addRotaShifts } from "../../features/Schedule/scheduleService";
import { getAllStaff } from "../../features/Staff/staffService";
import Loader from "../../shared/components/loader";
import RotaShiftDrawer from "./components/RotaShiftDrawer";

export default function RotaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [preSelectedDay, setPreSelectedDay] = useState(null);
  const [preSelectedStaffId, setPreSelectedStaffId] = useState(null);
  const [showCost, setShowCost] = useState(true);

  // Custom Salary Edit States
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [editingRotaEmployee, setEditingRotaEmployee] = useState(null);
  const [newSalaryAmount, setNewSalaryAmount] = useState(0);
  const [salarySubmitLoading, setSalarySubmitLoading] = useState(false);

  // Assign Staff Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSearchText, setAssignSearchText] = useState('');
  const [selectedNewStaffIds, setSelectedNewStaffIds] = useState([]);
  const [assignSubmitLoading, setAssignSubmitLoading] = useState(false);

  // Monthly Shift Drawer States
  const [monthlyDrawerOpen, setMonthlyDrawerOpen] = useState(false);
  const [monthlyStaff, setMonthlyStaff] = useState(null);
  const [monthlyForm] = Form.useForm();


  const fetchData = async () => {
    setLoading(true);
    try {
      const [detailsRes, staffRes] = await Promise.all([
        getRotaDetails(id),
        getAllStaff()
      ]);

      if (detailsRes.status === "success") {
        setDetails(detailsRes);
      }

      if (staffRes && (staffRes.status === "success" || Array.isArray(staffRes.data))) {
        const staffList = Array.isArray(staffRes.data) ? staffRes.data : [];
        setStaffMembers(staffList.map(item => ({
          id: String(item.employee_id),
          name: item.full_name,
          role: item.role,
          department: item.department,
          salary: parseFloat(item.salary || 0),
          salary_type: item.salary_type
        })));
      }
    } catch (error) {
      toast.error("Failed to fetch rota details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const displayStaff = useMemo(() => {
    if (!details?.data) return [];
    return staffMembers.filter(staff =>
      details.data.some(d => String(d.employee_id) === String(staff.id))
    );
  }, [staffMembers, details]);

  const availableStaff = useMemo(() => {
    if (!details?.data) return staffMembers;
    const currentIds = new Set(details.data.map(d => String(d.employee_id)));
    return staffMembers.filter(staff => !currentIds.has(String(staff.id)));
  }, [staffMembers, details]);

  const filteredAvailableStaff = useMemo(() => {
    return availableStaff.filter(staff =>
      (staff.name || '').toLowerCase().includes(assignSearchText.toLowerCase()) ||
      (staff.role || '').toLowerCase().includes(assignSearchText.toLowerCase())
    );
  }, [availableStaff, assignSearchText]);

  const handleOpenSalaryModal = (record) => {
    const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));
    if (!staffInDetails || !staffInDetails.salary_info) {
      toast.error("Salary info not found for this employee");
      return;
    }
    setEditingRotaEmployee({
      rota_employee_id: staffInDetails.salary_info.id,
      name: record.name,
      current_salary: staffInDetails.salary_info.salary_amount,
      salary_type: staffInDetails.salary_info.salary_type
    });
    setNewSalaryAmount(Number(staffInDetails.salary_info.salary_amount));
    setSalaryModalOpen(true);
  };

  const handleUpdateSalary = async () => {
    if (!editingRotaEmployee) return;
    setSalarySubmitLoading(true);
    try {
      const response = await updateRotaEmployeeSalary(
        editingRotaEmployee.rota_employee_id,
        newSalaryAmount.toString()
      );
      if (response && response.status === "success") {
        toast.success("Employee salary updated successfully!");
        setSalaryModalOpen(false);
        setEditingRotaEmployee(null);
        fetchData();
      } else {
        toast.error(response?.message || "Failed to update salary");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setSalarySubmitLoading(false);
    }
  };

  const handleAssignStaff = async () => {
    if (selectedNewStaffIds.length === 0) {
      toast.error("Please select at least one staff member to assign");
      return;
    }
    setAssignSubmitLoading(true);
    try {
      const currentEmployeeIds = details?.data?.map(d => Number(d.employee_id)) || [];
      const newIds = selectedNewStaffIds.map(Number);
      const finalEmployeeIds = [...currentEmployeeIds, ...newIds];

      const response = await assignEmployeesToRota(Number(id), finalEmployeeIds);
      if (response && response.status === "success") {
        toast.success("Staff assigned successfully!");
        setAssignModalOpen(false);
        setSelectedNewStaffIds([]);
        setAssignSearchText('');
        fetchData();
      } else {
        toast.error(response?.message || "Failed to assign staff");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setAssignSubmitLoading(false);
    }
  };

  const handleSaveMonthlyShifts = async (values) => {
    if (!monthlyStaff) return;
    setDrawerLoading(true);
    try {
      const daysCount = dayjs(`${rotaYear}-${rotaMonth}-01`).daysInMonth();
      const shiftsArray = [];

      for (let day = 1; day <= daysCount; day++) {
        shiftsArray.push({
          day_number: String(day),
          shift_type: 'Morning',
          start_time: values.times[0].format('HH:mm:ss'),
          end_time: values.times[1].format('HH:mm:ss'),
          break_start: values.break_times?.[0]?.format('HH:mm:ss') || null,
          break_end: values.break_times?.[1]?.format('HH:mm:ss') || null,
          notes: values.notes || ""
        });
      }

      const payload = {
        rota_id: Number(id),
        month: Number(rotaMonth),
        year: Number(rotaYear),
        data: [
          {
            employee_id: Number(monthlyStaff.id),
            shifts: shiftsArray
          }
        ]
      };

      const response = await addRotaShifts(payload);
      if (response && response.status === "success") {
        toast.success(`Assigned ${shiftsArray.length} shifts for the month successfully!`);
        setMonthlyDrawerOpen(false);
        setMonthlyStaff(null);
        monthlyForm.resetFields();
        fetchData();
      } else {
        toast.error(response?.message || "Failed to assign monthly shifts");
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setDrawerLoading(false);
    }
  };


  const rotaMonth = useMemo(() => {
    const name = details?.rota_name || "";
    if (name.includes("يناير")) return 1;
    if (name.includes("فبراير")) return 2;
    if (name.includes("مارس")) return 3;
    if (name.includes("أبريل")) return 4;
    if (name.includes("مايو")) return 5;
    if (name.includes("يونيو")) return 6;
    if (name.includes("يوليو")) return 7;
    if (name.includes("أغسطس")) return 8;
    if (name.includes("سبتمبر")) return 9;
    if (name.includes("أكتوبر")) return 10;
    if (name.includes("نوفمبر")) return 11;
    if (name.includes("ديسمبر")) return 12;
    return 6;
  }, [details]);

  const rotaYear = useMemo(() => {
    const yearMatch = details?.rota_name?.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : dayjs().year();
  }, [details]);

  const allDayNumbers = useMemo(() => {
    if (!details?.data) return Array.from({ length: 31 }, (_, i) => i + 1);
    const days = new Set();
    details.data.forEach(emp => {
      emp.shifts?.forEach(shift => {
        days.add(Number(shift.day_number));
      });
    });
    if (days.size === 0) return Array.from({ length: 31 }, (_, i) => i + 1);
    const maxDay = Math.max(...Array.from(days), 31);
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [details]);

  const dailyCosts = useMemo(() => {
    const costs = {};
    allDayNumbers.forEach(day => {
      let dailyTotal = 0;
      displayStaff.forEach(staff => {
        const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(staff.id));
        const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];

        shifts.forEach(shift => {
          const currentSalary = parseFloat(staffInDetails?.salary_info?.salary_amount ?? staff.salary ?? 0);
          if (currentSalary > 0) {
            const start = dayjs(`2000-01-01 ${shift.start_time}`);
            let end = dayjs(`2000-01-01 ${shift.end_time}`);
            if (end.isBefore(start)) end = end.add(1, "day");
            const hours = end.diff(start, "hour", true);
            dailyTotal += currentSalary * hours;
          }
        });
      });
      costs[day] = dailyTotal;
    });
    return costs;
  }, [allDayNumbers, displayStaff, details]);

  const grandTotal = useMemo(() => {
    return Object.values(dailyCosts).reduce((acc, curr) => acc + curr, 0);
  }, [dailyCosts]);

  const dailyHours = useMemo(() => {
    const hours = {};
    allDayNumbers.forEach(day => {
      let dayHours = 0;
      displayStaff.forEach(staff => {
        const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(staff.id));
        const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];
        shifts.forEach(shift => {
          const start = dayjs(`2000-01-01 ${shift.start_time}`);
          let end = dayjs(`2000-01-01 ${shift.end_time}`);
          if (end.isBefore(start)) end = end.add(1, "day");
          dayHours += end.diff(start, "hour", true);
        });
      });
      hours[day] = dayHours;
    });
    return hours;
  }, [allDayNumbers, displayStaff, details]);

  const grandTotalHours = useMemo(() => {
    return Object.values(dailyHours).reduce((acc, curr) => acc + curr, 0);
  }, [dailyHours]);


  const handleOpenAdd = (day, staffId) => {
    setEditShift(null);
    setPreSelectedDay(day);
    setPreSelectedStaffId(staffId);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditShift(shift);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditShift(null);
  };

  const handleSubmitShift = async (values) => {
    setDrawerLoading(true);
    try {
      if (editShift) {
        const dayNum = values.day_number || editShift.day_number;
        const shiftDate = `${rotaYear}-${String(rotaMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const payload = {
          shift_id: Number(editShift.shift_id || editShift.id),
          employee_id: Number(values.employee_id || editShift.employee_id),
          shift_date: shiftDate,
          shift_type: 'Morning',
          start_time: values.start_time || editShift.start_time,
          end_time: values.end_time || editShift.end_time,
          break_start: values.break_start || editShift.break_start || "12:00",
          break_end: values.break_end || editShift.break_end || "13:00",
          notes: values.notes !== undefined ? values.notes : (editShift.notes || ""),
          rota_id: Number(id)
        };
        const response = await updateShift(payload);
        if (response && response.status === "success") {
          toast.success("Shift updated in template and schedule");
        } else {
          toast.error(response?.message || "Failed to update shift");
        }
      } else {
        const shiftDate = `${rotaYear}-${String(rotaMonth).padStart(2, '0')}-${String(values.day_number).padStart(2, '0')}`;
        const payload = {
          employee_id: Number(values.employee_id),
          shift_date: shiftDate,
          shift_type: 'Morning',
          start_time: values.start_time,
          end_time: values.end_time,
          break_start: values.break_start || "12:00",
          break_end: values.break_end || "13:00",
          notes: values.notes || "",
          rota_id: Number(id)
        };
        const response = await addShift(payload);
        if (response && response.status === "success") {
          toast.success("Shift added to template and schedule");
        } else {
          toast.error(response?.message || "Failed to add shift");
        }
      }
      handleCloseDrawer();
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDeleteShift = async (shift) => {
    try {
      const response = await deleteShift(Number(shift.shift_id || shift.id));
      if (response && response.status === "success") {
        toast.success("Shift removed from template and schedule");
        fetchData();
      } else {
        toast.error(response?.message || "Failed to delete shift");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };


  const columns = useMemo(() => {
    const cols = [
      {
        title: "Employee",
        key: "employee",
        width: 140,
        fixed: 'left',
        render: (_, record) => {
          const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));
          const currentSalary = staffInDetails?.salary_info?.salary_amount ?? record.salary ?? 0;
          const salaryType = staffInDetails?.salary_info?.salary_type ?? record.salary_type ?? 'Hourly';

          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                {record.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold truncate leading-none">{record.name}</div>
                  <Tooltip title="Set monthly fixed shifts">
                    <button 
                      onClick={() => {
                        setMonthlyStaff(record);
                        setMonthlyDrawerOpen(true);
                      }}
                      className="text-primary/60 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Calendar size={11} />
                    </button>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-text/40 truncate uppercase">{record.role}</span>
                  {staffInDetails?.salary_info && (
                    <>
                      <span className="text-[9px] text-text/30">•</span>
                      <span 
                        className="text-[9px] font-bold text-primary flex items-center gap-0.5 cursor-pointer hover:underline"
                        onClick={() => handleOpenSalaryModal(record)}
                      >
                        {Number(currentSalary).toLocaleString('en-US', { maximumFractionDigits: 0 })} ({salaryType === 'Monthly' ? 'M' : 'H'})
                        <Edit2 size={8} className="text-text/30 ml-0.5 hover:text-primary" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }
      }
    ];

    allDayNumbers.forEach(day => {
      const dateObj = dayjs(`${rotaYear}-${String(rotaMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      const dayName = dateObj.format('ddd');
      const isWeekend = dateObj.day() === 5 || dateObj.day() === 6;
      const weekendCellStyle = isWeekend ? { backgroundColor: 'rgba(34,197,94,0.06)' } : {};

      cols.push({
        title: (
          <div className="text-center">
            <div className={`text-[9px] font-bold uppercase leading-none ${isWeekend ? 'text-emerald-500' : 'text-text/40'}`}>
              {dayName}
            </div>
            <div className={`text-[11px] font-black leading-tight mt-0.5 ${isWeekend ? 'text-emerald-500' : 'text-primary'}`}>
              {day}-{rotaMonth}-{rotaYear}
            </div>
          </div>
        ),
        key: `day_${day}`,
        width: 100,
        align: 'center',
        onHeaderCell: () => ({ style: weekendCellStyle }),
        onCell: () => ({ style: weekendCellStyle }),
        render: (_, record) => {
          const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));
          const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];

          return (
            <div className="group relative min-h-[60px] flex flex-col gap-1">
              {shifts.map((shift, idx) => (
                <div key={shift.shift_id || idx} className="p-1 rounded bg-primary/5 border border-primary/10 text-left relative group/item hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] font-bold text-primary/70 uppercase">{shift.shift_type.charAt(0)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">

                      <button onClick={() => handleOpenEdit({ ...shift, employee_id: staffInDetails?.employee_id ?? record.id })} className="text-primary hover:text-primary/70">
                        <Edit2 size={8} />
                      </button>


                      <Popconfirm title="Delete shift?" onConfirm={() => handleDeleteShift({ ...shift, employee_id: staffInDetails?.employee_id ?? record.id })}>
                        <button className="text-red-500 hover:text-red-600">
                          <Trash2 size={8} />
                        </button>
                      </Popconfirm>

                    </div>
                  </div>
                  <div className="text-[9px] text-text font-bold leading-tight">
                    {shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)}
                  </div>
                  {shift.break_start && (
                    <div className="text-[7px] text-text/40 leading-none mt-0.5">
                      B: {shift.break_start.slice(0, 5)}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => handleOpenAdd(day, record.id)}
                className="opacity-0 group-hover:opacity-100 absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
              >
                <Plus size={10} strokeWidth={3} />
              </button>

              {shifts.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-text/5">—</div>
              )}
            </div>
          );
        }
      });
    });


    cols.push({
      title: (
        <div className="text-center">
          <div className="text-[9px] text-primary uppercase font-bold">Total</div>
          <div className="text-[11px] font-black text-primary">COST</div>
        </div>
      ),
      key: "employee_total",
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        let employeeTotal = 0;
        let employeeTotalHours = 0;
        const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));

        allDayNumbers.forEach(day => {
          const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];
          shifts.forEach(shift => {
            const start = dayjs(`2000-01-01 ${shift.start_time}`);
            let end = dayjs(`2000-01-01 ${shift.end_time}`);
            if (end.isBefore(start)) end = end.add(1, "day");
            const hours = end.diff(start, "hour", true);
            employeeTotalHours += hours;
            const currentSalary = parseFloat(staffInDetails?.salary_info?.salary_amount ?? record.salary ?? 0);
            if (currentSalary > 0) {
              employeeTotal += currentSalary * hours;
            }
          });
        });

        return (
          <div className="flex flex-col items-center gap-0.5">
            {employeeTotalHours > 0 && (
              <div className="text-[8px] font-bold text-text/40 leading-none">
                {employeeTotalHours % 1 === 0 ? employeeTotalHours : employeeTotalHours.toFixed(1)}h
              </div>
            )}
            {showCost && (
              <div className="text-[11px] font-black text-primary">
                {employeeTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            )}
          </div>
        );
      }
    });

    return cols;
  }, [allDayNumbers, rotaMonth, rotaYear, details, showCost, displayStaff]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/rota')}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-text leading-tight">Rota Details</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text/50">{details?.rota_name}</span>
              <Tag color="primary" className="m-0 font-bold text-[9px] px-1.5 py-0 leading-none">
                {displayStaff.length} Staff
              </Tag>
            </div>
          </div>
        </div>
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<Plus size={12} />}
            onClick={() => setAssignModalOpen(true)}
            className="text-[11px] font-semibold flex items-center gap-1"
          >
            Assign Staff
          </Button>
          <Button
            size="small"
            onClick={() => setShowCost(prev => !prev)}
            className="text-[11px] font-semibold"
          >
            {showCost ? 'Hide Cost' : 'Show Cost'}
          </Button>
        </Space>
      </div>

      {/* Grid Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={displayStaff}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
          size="small"
          bordered
          className="rota-details-compact-table"
          summary={() => (
              <Table.Summary fixed="bottom">
              <Table.Summary.Row className="bg-primary/5 font-bold">
                <Table.Summary.Cell index={0} fixed="left">
                  <div className="text-[10px] text-primary flex items-center gap-1">
                    <DollarSign size={12} />
                    <span>Total</span>
                  </div>
                </Table.Summary.Cell>
                {allDayNumbers.map((day, index) => (
                  <Table.Summary.Cell key={day} index={index + 1} align="center">
                    <div className="flex flex-col items-center gap-0.5">
                      {dailyHours[day] > 0 && (
                        <div className="text-[8px] font-bold text-text/40 leading-none">
                          {dailyHours[day] % 1 === 0 ? dailyHours[day] : dailyHours[day].toFixed(1)}h
                        </div>
                      )}
                      {showCost && (
                        <div className="text-primary text-[10px]">
                          {dailyCosts[day] > 0 ? dailyCosts[day].toLocaleString('en-US', { maximumFractionDigits: 0 }) : "—"}
                        </div>
                      )}
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell index={allDayNumbers.length + 1} align="center" className="bg-primary/10">
                  <div className="flex flex-col items-center gap-0.5">
                    {grandTotalHours > 0 && (
                      <div className="text-[8px] font-bold text-text/40 leading-none">
                        {grandTotalHours % 1 === 0 ? grandTotalHours : grandTotalHours.toFixed(1)}h
                      </div>
                    )}
                    {showCost && (
                      <div className="text-primary text-[11px] font-black">
                        {grandTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      <RotaShiftDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmitShift}
        editShift={editShift}
        loading={drawerLoading}
        staffMembers={staffMembers}
        preSelectedDay={preSelectedDay}
        preSelectedStaffId={preSelectedStaffId}
        allDayNumbers={allDayNumbers}
      />

      {/* Update Custom Salary Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <DollarSign size={18} />
            <span>Edit Employee Rota Salary</span>
          </div>
        }
        open={salaryModalOpen}
        onOk={handleUpdateSalary}
        onCancel={() => {
          setSalaryModalOpen(false);
          setEditingRotaEmployee(null);
        }}
        confirmLoading={salarySubmitLoading}
        okText="Update Salary"
        cancelText="Cancel"
        className="rounded-2xl overflow-hidden"
      >
        {editingRotaEmployee && (
          <div className="py-4 space-y-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h4 className="text-sm font-bold text-text mb-1">
                {editingRotaEmployee.name}
              </h4>
              <p className="text-xs text-text/60 font-medium">
                Current Rate: <span className="font-bold text-primary">{Number(editingRotaEmployee.current_salary).toLocaleString('en-US')}</span> per {editingRotaEmployee.salary_type === 'Monthly' ? 'Month' : 'Hour'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-text/40 tracking-wider">
                New Salary Amount ({editingRotaEmployee.salary_type === 'Monthly' ? 'Monthly' : 'Hourly'})
              </label>
              <InputNumber
                value={newSalaryAmount}
                onChange={setNewSalaryAmount}
                min={0}
                className="w-full h-12 rounded-xl flex items-center font-bold text-base border-border"
                placeholder="Enter new rate..."
                precision={2}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Monthly Shift Settings Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <Calendar size={18} />
            <span>Set Month Shifts ({monthlyStaff?.name})</span>
          </div>
        }
        placement="right"
        width={400}
        onClose={() => {
          setMonthlyDrawerOpen(false);
          setMonthlyStaff(null);
          monthlyForm.resetFields();
        }}
        open={monthlyDrawerOpen}
        footer={
          <div className="flex justify-end gap-2 py-2">
            <Button onClick={() => {
              setMonthlyDrawerOpen(false);
              setMonthlyStaff(null);
              monthlyForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              loading={drawerLoading} 
              onClick={() => monthlyForm.submit()}
              className="font-bold"
            >
              Apply to Month
            </Button>
          </div>
        }
      >
        <Form
          form={monthlyForm}
          layout="vertical"
          onFinish={handleSaveMonthlyShifts}
        >
          <Form.Item
            name="times"
            label="Work Hours"
            rules={[{ required: true, message: 'Work hours range is required' }]}
          >
            <TimePicker.RangePicker format="HH:mm" className="w-full h-11" />
          </Form.Item>

          <Form.Item
            name="break_times"
            label="Break Hours (Optional)"
          >
            <TimePicker.RangePicker format="HH:mm" className="w-full h-11" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Shift Notes"
          >
            <Input.TextArea rows={3} placeholder="Add any special notes..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Assign New Staff Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary font-bold">
            <UserPlus size={18} />
            <span>Assign New Staff to Rota</span>
          </div>
        }
        open={assignModalOpen}
        onOk={handleAssignStaff}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedNewStaffIds([]);
          setAssignSearchText('');
        }}
        confirmLoading={assignSubmitLoading}
        okText="Assign Selected"
        cancelText="Cancel"
        className="rounded-2xl overflow-hidden"
      >
        <div className="py-4 space-y-4">
          <Input
            prefix={<Search size={16} className="text-text/30 mr-1" />}
            placeholder="Search available staff by name or role..."
            size="large"
            allowClear
            value={assignSearchText}
            onChange={(e) => setAssignSearchText(e.target.value)}
            className="rounded-xl h-11"
          />

          <Divider className="my-2" />

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredAvailableStaff.length > 0 ? (
              filteredAvailableStaff.map((staff) => {
                const isSelected = selectedNewStaffIds.includes(String(staff.id));
                return (
                  <div
                    key={staff.id}
                    onClick={() => {
                      const stringId = String(staff.id);
                      setSelectedNewStaffIds(prev =>
                        prev.includes(stringId)
                          ? prev.filter(item => item !== stringId)
                          : [...prev, stringId]
                      );
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface border-border hover:border-text/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-primary/10 text-primary font-bold text-xs" size={36}>
                        {staff.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <h4 className="text-xs font-bold text-text leading-tight">{staff.name}</h4>
                        <p className="text-[10px] font-semibold text-text/40 uppercase mt-0.5">{staff.role || 'No Role'}</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const stringId = String(staff.id);
                        setSelectedNewStaffIds(prev =>
                          e.target.checked
                            ? [...prev, stringId]
                            : prev.filter(item => item !== stringId)
                        );
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-text/30 font-medium text-xs">
                No new staff members available to assign.
              </div>
            )}
          </div>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        .rota-details-compact-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          padding: 6px 4px !important;
        }
        .rota-details-compact-table .ant-table-cell {
          padding: 4px !important;
        }
        .rota-details-compact-table .ant-table-cell-fix-left,
        .rota-details-compact-table .ant-table-cell-fix-right {
          background: #ffffff !important;
          z-index: 20 !important;
        }
      `}} />
    </div>
  );
}

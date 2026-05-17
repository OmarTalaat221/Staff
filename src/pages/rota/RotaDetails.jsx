import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Avatar, Tooltip, Button, Space, Card, Tag, Popconfirm } from "antd";
import { Clock, Coffee, Info, ChevronLeft, ChevronRight, ArrowLeft, Calendar, DollarSign, Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getRotaDetails, addRotaItem, updateRotaItem, deleteRotaItem } from "../../features/Schedule/scheduleService";
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
      staffMembers.forEach(staff => {
        const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(staff.id));
        const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];

        shifts.forEach(shift => {
          if (staff.salary) {
            const start = dayjs(`2000-01-01 ${shift.start_time}`);
            let end = dayjs(`2000-01-01 ${shift.end_time}`);
            if (end.isBefore(start)) end = end.add(1, "day");
            const hours = end.diff(start, "hour", true);
            dailyTotal += staff.salary * hours;
          }
        });
      });
      costs[day] = dailyTotal;
    });
    return costs;
  }, [allDayNumbers, staffMembers, details]);

  const grandTotal = useMemo(() => {
    return Object.values(dailyCosts).reduce((acc, curr) => acc + curr, 0);
  }, [dailyCosts]);


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
      const payload = {
        ...values,
        rota_id: id,
        month: rotaMonth,
        year: rotaYear
      };

      if (editShift) {
        await updateRotaItem({
          ...payload,
          old_start_time: editShift.start_time,
          employee_id: values.employee_id || editShift.employee_id,
          day_number: values.day_number || editShift.day_number
        });
        toast.success("Shift updated in template and schedule");
      } else {
        await addRotaItem(payload);
        toast.success("Shift added to template and schedule");
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
      await deleteRotaItem({
        rota_id: id,
        employee_id: shift.employee_id,
        day_number: shift.day_number,
        start_time: shift.start_time,
        month: rotaMonth,
        year: rotaYear
      });
      toast.success("Shift removed from template and schedule");
      fetchData();
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
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              {record.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate leading-none">{record.name}</div>
              <div className="text-[9px] text-text/40 truncate uppercase mt-0.5">{record.role}</div>
            </div>
          </div>
        )
      }
    ];

    allDayNumbers.forEach(day => {
      cols.push({
        title: (
          <div className="text-center">
            <div className="text-[9px] text-text/30 uppercase font-bold">D</div>
            <div className="text-[11px] font-black text-primary leading-none">{day}-{rotaMonth}</div>
          </div>
        ),
        key: `day_${day}`,
        width: 100,
        align: 'center',
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

                      <button onClick={() => handleOpenEdit(shift)} className="text-primary hover:text-primary/70">
                        <Edit2 size={8} />
                      </button>


                      <Popconfirm title="Delete shift?" onConfirm={() => handleDeleteShift(shift)}>
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
        const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));

        allDayNumbers.forEach(day => {
          const shifts = staffInDetails?.shifts?.filter(s => Number(s.day_number) === day) || [];
          shifts.forEach(shift => {
            if (record.salary) {
              const start = dayjs(`2000-01-01 ${shift.start_time}`);
              let end = dayjs(`2000-01-01 ${shift.end_time}`);
              if (end.isBefore(start)) end = end.add(1, "day");
              const hours = end.diff(start, "hour", true);
              employeeTotal += record.salary * hours;
            }
          });
        });

        return (
          <div className="text-[11px] font-black text-primary">
            {employeeTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        );
      }
    });

    return cols;
  }, [allDayNumbers, rotaMonth, details]);

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
                {staffMembers.length} Staff
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={staffMembers}
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
                    <div className="text-primary text-[10px]">
                      {dailyCosts[day] > 0 ? dailyCosts[day].toLocaleString('en-US', { maximumFractionDigits: 0 }) : "—"}
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell index={allDayNumbers.length + 1} align="center" className="bg-primary/10">
                  <div className="text-primary text-[11px] font-black">
                    {grandTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
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

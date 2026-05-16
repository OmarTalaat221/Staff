import { memo, useMemo, useState } from "react";
import { Modal, Table, Avatar, Tooltip, Button, Space } from "antd";
import { Clock, Coffee, Info, ChevronLeft, ChevronRight } from "lucide-react";

const RotaDetailsModal = memo(function RotaDetailsModal({
  open,
  onClose,
  details,
  staffMembers,
  loading
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const DAYS_PER_PAGE = 7; // Show 1 week at a time as requested

  // Try to determine the month from the rota name (e.g., "يونيو" -> 6)
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
    return 6; // Default to June
  }, [details]);

  // Extract all unique day numbers from the data
  const allDayNumbers = useMemo(() => {
    if (!details?.data) return Array.from({ length: 31 }, (_, i) => i + 1);
    const days = new Set();
    details.data.forEach(emp => {
      emp.shifts?.forEach(shift => {
        days.add(Number(shift.day_number));
      });
    });
    
    // If no shifts, assume a full month of 31 days
    if (days.size === 0) return Array.from({ length: 31 }, (_, i) => i + 1);
    
    // Find the max day number to show at least until then
    const maxDay = Math.max(...Array.from(days), 31);
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [details]);

  const visibleDayNumbers = useMemo(() => {
    return allDayNumbers.slice(dayOffset, dayOffset + DAYS_PER_PAGE);
  }, [allDayNumbers, dayOffset]);

  const handlePrevDays = () => setDayOffset(prev => Math.max(0, prev - DAYS_PER_PAGE));
  const handleNextDays = () => setDayOffset(prev => Math.min(allDayNumbers.length - DAYS_PER_PAGE, prev + DAYS_PER_PAGE));

  const columns = useMemo(() => {
    const cols = [
      {
        title: "Employee",
        key: "employee",
        width: 180,
        fixed: 'left',
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Avatar size="small" style={{ backgroundColor: '#84B067' }}>{record.name.charAt(0)}</Avatar>
            <div className="min-w-0 text-left">
              <div className="text-sm font-bold truncate">{record.name}</div>
              <div className="text-[10px] text-text/50 truncate uppercase tracking-wider">{record.role}</div>
            </div>
          </div>
        )
      }
    ];

    visibleDayNumbers.forEach(day => {
      cols.push({
        title: (
          <div className="text-center py-1">
            <div className="text-[10px] text-text/40 uppercase font-bold mb-0.5">Day</div>
            <div className="text-sm font-bold text-primary">{day}-{rotaMonth}</div>
          </div>
        ),
        key: `day_${day}`,
        width: 140,
        align: 'center',
        render: (_, record) => {
          const staffInDetails = details?.data?.find(d => String(d.employee_id) === String(record.id));
          const shift = staffInDetails?.shifts?.find(s => Number(s.day_number) === day);
          
          if (!shift) return <div className="h-[60px] flex items-center justify-center"><span className="text-text/10">—</span></div>;

          return (
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-left min-h-[60px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-primary uppercase">{shift.shift_type}</span>
                {shift.notes && (
                  <Tooltip title={shift.notes}>
                    <Info size={10} className="text-primary/40 cursor-help" />
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-text font-medium leading-tight">
                <Clock size={10} className="text-text/40" />
                {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
              </div>
              {shift.break_start && (
                <div className="flex items-center gap-1 text-[10px] text-text/40 mt-1 leading-tight">
                  <Coffee size={10} />
                  {shift.break_start.slice(0, 5)}
                </div>
              )}
            </div>
          );
        }
      });
    });

    return cols;
  }, [visibleDayNumbers, rotaMonth, details]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center justify-between mr-8">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-text">Rota Template Details</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text/50 font-normal">
                Template: {details?.rota_name}
              </span>
              <span className="text-text/20">|</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
                {staffMembers.length} Staff Members
              </span>
            </div>
          </div>
          <Space>
            <Button 
              icon={<ChevronLeft size={16} />} 
              onClick={handlePrevDays}
              disabled={dayOffset === 0}
              size="small"
            >
              Prev Week
            </Button>
            <div className="text-xs font-semibold px-2">
              Days {dayOffset + 1} - {Math.min(dayOffset + DAYS_PER_PAGE, allDayNumbers.length)}
            </div>
            <Button 
              icon={<ChevronRight size={16} />} 
              onClick={handleNextDays}
              disabled={dayOffset + DAYS_PER_PAGE >= allDayNumbers.length}
              size="small"
              iconPosition="end"
            >
              Next Week
            </Button>
          </Space>
        </div>
      }
      footer={null}
      width={1200}
      centered
      loading={loading}
      destroyOnClose
    >
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <Table
          columns={columns}
          dataSource={staffMembers}
          rowKey="id"
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
          size="middle"
          bordered
          className="rota-details-table"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rota-details-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          padding: 8px !important;
        }
        .rota-details-table .ant-table-cell {
          padding: 6px !important;
        }
        .rota-details-table .ant-table-cell-fix-left {
          background: #ffffff !important;
          z-index: 20 !important;
        }
      `}} />
    </Modal>
  );
});

export default RotaDetailsModal;

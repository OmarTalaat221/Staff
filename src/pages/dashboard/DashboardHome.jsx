import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  CalendarCheck,
  TreePalm,
  Banknote,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getDashboardData } from "../../features/Dashboard/dashboardService";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeDonutSegment, setActiveDonutSegment] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData();
      if (response && response.status === "success") {
        setData(response.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Stats Card data mapping
  const statsList = useMemo(() => {
    if (!data?.stats) return [];
    return [
      {
        label: "Total Staff",
        value: data.stats.total_staff.value,
        change: data.stats.total_staff.change,
        icon: Users,
        color: "bg-primary/10 text-primary",
      },
      {
        label: "On Shift Today",
        value: data.stats.on_shift_today.value,
        change: data.stats.on_shift_today.change,
        icon: CalendarCheck,
        color: "bg-success/10 text-success",
      },
      {
        label: "Pending Leaves",
        value: data.stats.pending_leaves.value,
        change: data.stats.pending_leaves.change,
        icon: TreePalm,
        color: "bg-warning/10 text-warning",
      },
      {
        label: "Advance Requests",
        value: data.stats.advance_requests.value,
        change: data.stats.advance_requests.change,
        icon: Banknote,
        color: "bg-danger/10 text-danger",
      },
    ];
  }, [data]);

  // Dynamic SVG coordinate mapping for Line Chart
  const lineChartData = useMemo(() => {
    const trendData = data?.chart_expenses_trend || [];
    const chartWidth = 500;
    const chartHeight = 200;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 35;
    const paddingBottom = 20;

    const expensesList = trendData.map((d) => parseFloat(d.expenses || 0));
    const maxExpense = Math.max(...expensesList, 1000); // fallback to prevent division by zero

    const points = trendData.map((pt, idx) => {
      const x = paddingLeft + (idx / Math.max(trendData.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = (chartHeight - paddingBottom) - (parseFloat(pt.expenses || 0) / maxExpense) * (chartHeight - paddingBottom - paddingTop);
      return {
        x,
        y,
        month: pt.month,
        val: `${parseFloat(pt.expenses || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} EGP`,
        staff: `${pt.active_staff} Active`,
      };
    });

    const linePath = points.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
    const areaPath = points.length > 0
      ? `M ${points[0].x} 180 ` + points.map((pt) => `L ${pt.x} ${pt.y}`).join(" ") + ` L ${points[points.length - 1].x} 180 Z`
      : "";

    return { points, linePath, areaPath };
  }, [data]);

  // Donut chart status normalization
  const donutData = useMemo(() => {
    const dist = data?.staff_status_distribution || {
      on_shift: { count: 0, percentage: 0 },
      on_leave: { count: 0, percentage: 0 },
      pending_requests: { count: 0, percentage: 0 },
    };

    const countShift = Number(dist.on_shift.count || 0);
    const countLeave = Number(dist.on_leave.count || 0);
    const countPending = Number(dist.pending_requests.count || 0);
    const sum = countShift + countLeave + countPending || 1;

    // Normalizing percentages for donut segment rendering
    const onShiftPercent = Math.round((countShift / sum) * 100);
    const onLeavePercent = Math.round((countLeave / sum) * 100);
    const pendingPercent = 100 - onShiftPercent - onLeavePercent;

    const C = 251.3; // Circumference for radius 40
    const shiftLen = C * (onShiftPercent / 100);
    const leaveLen = C * (onLeavePercent / 100);
    const pendingLen = C * (pendingPercent / 100);

    const shiftOffset = 0;
    const leaveOffset = -shiftLen;
    const pendingOffset = -(shiftLen + leaveLen);

    return {
      countShift,
      countLeave,
      countPending,
      onShiftPercent,
      onLeavePercent,
      pendingPercent,
      dash: {
        shift: `${shiftLen} ${C}`,
        leave: `${leaveLen} ${C}`,
        pending: `${pendingLen} ${C}`,
      },
      offset: {
        shift: shiftOffset.toString(),
        leave: leaveOffset.toString(),
        pending: pendingOffset.toString(),
      },
    };
  }, [data]);

  const recentRequests = data?.recent_requests || [];
  const unreadMessages = data?.unread_messages || [];

  const statusColor = {
    Pending: "bg-warning/10 text-warning",
    Approved: "bg-success/10 text-success",
    Completed: "bg-success/10 text-success",
    Rejected: "bg-danger/10 text-danger",
  };

  // Glassmorphism Skeleton loader for premium UX
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-36 bg-text/10 rounded-lg"></div>
            <div className="h-4 w-60 bg-text/5 rounded-lg"></div>
          </div>
          <div className="h-10 w-10 bg-text/5 rounded-xl"></div>
        </div>

        {/* Stats cards pulse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-text/15 rounded"></div>
                <div className="h-6 w-12 bg-text/20 rounded-md"></div>
                <div className="h-3.5 w-24 bg-text/10 rounded"></div>
              </div>
              <div className="w-11 h-11 bg-text/10 rounded-xl shrink-0"></div>
            </div>
          ))}
        </div>

        {/* Charts cards pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-text/15 rounded-md"></div>
              <div className="h-3.5 w-72 bg-text/10 rounded"></div>
            </div>
            <div className="flex-1 bg-text/5 rounded-xl mt-6"></div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-text/15 rounded-md"></div>
              <div className="h-3.5 w-48 bg-text/10 rounded"></div>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-text/15 mx-auto my-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-text text-2xl font-bold">Dashboard</h1>
          <p className="text-text/60 text-sm mt-1">
            Welcome back, Admin. Here is what is happening today.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text/50 hover:text-text hover:bg-bg transition-all cursor-pointer"
          title="Refresh Dashboard"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-5 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-text/10"
            >
              <div className="flex-1">
                <p className="text-text/60 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-text text-2xl font-black mt-1.5 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-text/50 text-[11px] font-semibold mt-1">{stat.change}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Expenses Trend Area Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-visible">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                <h2 className="text-text text-base font-bold">Monthly Expenses & Activity Trend</h2>
              </div>
              <span className="text-[10px] bg-primary/5 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/10">
                Live Data
              </span>
            </div>
            <p className="text-text/50 text-xs mt-1">
              Interactive visualization of operations expenditure and active on-shift staff.
            </p>
          </div>

          {/* SVG Area Chart Container */}
          <div className="relative mt-6 flex-1 min-h-[220px] select-none">
            {lineChartData.points.length > 0 ? (
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84B067" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#84B067" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
                <line x1="40" y1="35" x2="480" y2="35" stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />

                {/* Grid Labels */}
                <text x="15" y="133" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Min</text>
                <text x="15" y="83" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Mid</text>
                <text x="15" y="38" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Max</text>

                {/* Shaded Gradient Area */}
                <path d={lineChartData.areaPath} fill="url(#areaGrad)" />

                {/* Bold Gradient Line */}
                <path d={lineChartData.linePath} fill="none" stroke="#84B067" strokeWidth="3" strokeLinecap="round" />

                {/* Interactive Circles & Hover Hotspots */}
                {lineChartData.points.map((pt, index) => {
                  const isHovered = hoveredPoint === index;
                  return (
                    <g key={`${pt.month}-${index}`}>
                      {/* Pulsing indicator on hover */}
                      {isHovered && (
                        <circle cx={pt.x} cy={pt.y} r="8" fill="#84B067" opacity="0.3" />
                      )}
                      {/* Main Node Circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? "5" : "4"}
                        fill="#FFFFFF"
                        stroke="#84B067"
                        strokeWidth={isHovered ? "3.5" : "2.5"}
                        style={{ transition: "all 0.15s ease" }}
                      />
                      {/* Month Label */}
                      <text x={pt.x} y="196" textAnchor="middle" fill="rgba(0,0,0,0.4)" fontSize="10" fontWeight="bold">
                        {pt.month}
                      </text>

                      {/* Transparent Column Hotspot for easy hovering */}
                      <rect
                        x={pt.x - 25}
                        y="15"
                        width="50"
                        height="170"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-text/30 font-semibold">
                No expense trend data available
              </div>
            )}

            {/* Custom Dynamic Premium Tooltip Popover */}
            {hoveredPoint !== null && lineChartData.points[hoveredPoint] && (
              <div
                className="absolute bg-text text-white p-3 rounded-xl shadow-xl border border-white/10 z-10 pointer-events-none transition-all duration-150 flex flex-col gap-1 text-left"
                style={{
                  left: `${(lineChartData.points[hoveredPoint].x / 500) * 100}%`,
                  top: `${(lineChartData.points[hoveredPoint].y / 200) * 100 - 45}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-text rotate-45"></div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-wider leading-none">
                  {lineChartData.points[hoveredPoint].month} Expenses
                </span>
                <span className="text-sm font-black text-white leading-tight">
                  {lineChartData.points[hoveredPoint].val}
                </span>
                <span className="text-[9px] text-primary font-bold">
                  ⚡ {lineChartData.points[hoveredPoint].staff} staff on duty
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Circular Donut Attendance Distribution */}
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Award size={20} className="text-primary" />
              <h2 className="text-text text-base font-bold">Staff Status Share</h2>
            </div>
            <p className="text-text/50 text-xs mt-1">
              Distribution of company human resource categories.
            </p>
          </div>

          {/* Donut Render */}
          <div className="flex items-center justify-center my-4 relative">
            <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
              {/* Back track circle */}
              <circle cx="60" cy="60" r="40" fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="12" />

              {/* Segment 1: On Shift today */}
              {donutData.onShiftPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#84B067"
                  strokeWidth={activeDonutSegment === "active" ? "15" : "12"}
                  strokeDasharray={donutData.dash.shift}
                  strokeDashoffset={donutData.offset.shift}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-200 origin-center -rotate-90"
                  onMouseEnter={() => setActiveDonutSegment("active")}
                  onMouseLeave={() => setActiveDonutSegment(null)}
                />
              )}

              {/* Segment 2: Approved Leaves */}
              {donutData.onLeavePercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={activeDonutSegment === "leaves" ? "15" : "12"}
                  strokeDasharray={donutData.dash.leave}
                  strokeDashoffset={donutData.offset.leave}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-200 origin-center -rotate-90"
                  onMouseEnter={() => setActiveDonutSegment("leaves")}
                  onMouseLeave={() => setActiveDonutSegment(null)}
                />
              )}

              {/* Segment 3: Pending requests */}
              {donutData.pendingPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth={activeDonutSegment === "pending" ? "15" : "12"}
                  strokeDasharray={donutData.dash.pending}
                  strokeDashoffset={donutData.offset.pending}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-200 origin-center -rotate-90"
                  onMouseEnter={() => setActiveDonutSegment("pending")}
                  onMouseLeave={() => setActiveDonutSegment(null)}
                />
              )}
            </svg>

            {/* Centered statistics indicator */}
            <div className="absolute flex flex-col items-center justify-center select-none pointer-events-none">
              <span className="text-lg font-black text-text leading-none">
                {activeDonutSegment === "active"
                  ? `${donutData.onShiftPercent}%`
                  : activeDonutSegment === "leaves"
                  ? `${donutData.onLeavePercent}%`
                  : activeDonutSegment === "pending"
                  ? `${donutData.pendingPercent}%`
                  : donutData.countShift + donutData.countLeave + donutData.countPending}
              </span>
              <span className="text-[9px] text-text/40 font-bold uppercase tracking-wider mt-0.5">
                {activeDonutSegment === "active"
                  ? "Duty"
                  : activeDonutSegment === "leaves"
                  ? "Leaves"
                  : activeDonutSegment === "pending"
                  ? "Pending"
                  : "Staff"}
              </span>
            </div>
          </div>

          {/* Interactive Legends */}
          <div className="space-y-1.5 mt-2">
            <div
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeDonutSegment === "active" ? "bg-success/10 font-bold" : "hover:bg-bg"
              }`}
              onMouseEnter={() => setActiveDonutSegment("active")}
              onMouseLeave={() => setActiveDonutSegment(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span className="text-xs text-text/70">On Shift ({donutData.onShiftPercent}%)</span>
              </div>
              <span className="text-xs font-bold text-text">{donutData.countShift} Staff</span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeDonutSegment === "leaves" ? "bg-warning/10 font-bold" : "hover:bg-bg"
              }`}
              onMouseEnter={() => setActiveDonutSegment("leaves")}
              onMouseLeave={() => setActiveDonutSegment(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                <span className="text-xs text-text/70">On Leave ({donutData.onLeavePercent}%)</span>
              </div>
              <span className="text-xs font-bold text-text">{donutData.countLeave} Staff</span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeDonutSegment === "pending" ? "bg-info/10 font-bold" : "hover:bg-bg"
              }`}
              onMouseEnter={() => setActiveDonutSegment("pending")}
              onMouseLeave={() => setActiveDonutSegment(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs text-text/70">Pending Req ({donutData.pendingPercent}%)</span>
              </div>
              <span className="text-xs font-bold text-text">{donutData.countPending} Staff</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text text-lg font-semibold">Recent Requests</h2>
            <button
              onClick={() => navigate("/requests/leave")}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
            >
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentRequests.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-text/50 text-xs font-medium uppercase tracking-wider pb-3 pr-4">
                      Name
                    </th>
                    <th className="text-text/50 text-xs font-medium uppercase tracking-wider pb-3 pr-4">
                      Type
                    </th>
                    <th className="text-text/50 text-xs font-medium uppercase tracking-wider pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-text/50 text-xs font-medium uppercase tracking-wider pb-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-border/50 last:border-none hover:bg-bg/20 transition-colors"
                    >
                      <td className="text-text text-sm font-semibold py-3 pr-4">
                        {req.name}
                      </td>
                      <td className="text-text/70 text-sm py-3 pr-4">
                        {req.type}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                            statusColor[req.status] || "bg-text/10 text-text/70"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="text-text/50 text-xs font-semibold py-3">
                        {req.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-text/30 font-medium">
                No recent requests found
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text text-lg font-semibold">Messages</h2>
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
            >
              Open Chat
              <MessageSquare size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {unreadMessages.length > 0 ? (
              unreadMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-semibold">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-text text-sm font-medium truncate">
                        {msg.name}
                      </p>
                      <span className="text-text/40 text-[10px] font-semibold shrink-0">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-text/60 text-xs truncate mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-text/30 font-medium">
                No new messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  Users,
  CalendarCheck,
  TreePalm,
  Banknote,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Staff",
    value: "24",
    change: "+2 this month",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "On Shift Today",
    value: "18",
    change: "75% attendance",
    icon: CalendarCheck,
    color: "bg-success/10 text-success",
  },
  {
    label: "Pending Leaves",
    value: "5",
    change: "3 new today",
    icon: TreePalm,
    color: "bg-warning/10 text-warning",
  },
  {
    label: "Advance Requests",
    value: "3",
    change: "1 approved",
    icon: Banknote,
    color: "bg-danger/10 text-danger",
  },
];

const recentRequests = [
  {
    id: 1,
    name: "Ahmed Hassan",
    type: "Leave Request",
    status: "Pending",
    date: "Today",
  },
  {
    id: 2,
    name: "Sara Ali",
    type: "Cash Advance",
    status: "Approved",
    date: "Yesterday",
  },
  {
    id: 3,
    name: "Mohamed Youssef",
    type: "Leave Request",
    status: "Rejected",
    date: "2 days ago",
  },
  {
    id: 4,
    name: "Fatma Omar",
    type: "Cash Advance",
    status: "Pending",
    date: "3 days ago",
  },
];

const statusColor = {
  Pending: "bg-warning/10 text-warning",
  Approved: "bg-success/10 text-success",
  Rejected: "bg-danger/10 text-danger",
};

const unreadMessages = [
  {
    id: 1,
    name: "Ahmed Hassan",
    message: "Can I swap my shift on Friday?",
    time: "10 min ago",
  },
  {
    id: 2,
    name: "Sara Ali",
    message: "I submitted the advance request",
    time: "1 hour ago",
  },
  {
    id: 3,
    name: "Mohamed Youssef",
    message: "Thank you for approving my leave",
    time: "3 hours ago",
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-text text-2xl font-bold">Dashboard</h1>
        <p className="text-text/60 text-sm mt-1">
          Welcome back, Admin. Here is what is happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-5 flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <p className="text-text/60 text-sm">{stat.label}</p>
                <p className="text-text text-2xl font-bold mt-1">
                  {stat.value}
                </p>
                <p className="text-text/50 text-xs mt-1">{stat.change}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text text-lg font-semibold">Recent Requests</h2>
            <button className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
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
                    className="border-b border-border/50 last:border-none"
                  >
                    <td className="text-text text-sm font-medium py-3 pr-4">
                      {req.name}
                    </td>
                    <td className="text-text/70 text-sm py-3 pr-4">
                      {req.type}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="text-text/50 text-sm py-3">{req.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text text-lg font-semibold">Messages</h2>
            <button className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">
              Open Chat
              <MessageSquare size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {unreadMessages.map((msg) => (
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
                    <span className="text-text/40 text-xs shrink-0">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-text/60 text-sm truncate mt-0.5">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

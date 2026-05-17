import {
  LayoutDashboard,
  CalendarDays,
  TreePalm,
  Banknote,
  ArrowLeftRight,
  MessageSquare,
  BookOpen,
  Video,
  Users,
  Copy,
} from "lucide-react";

const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    key: "staff",
    label: "Staff",
    icon: Users,
    path: "/staff",
  },
  {
    key: "schedule",
    label: "Schedule",
    icon: CalendarDays,
    path: "/schedule",
  },
  {
    key: "rota",
    label: "Rota Templates",
    icon: Copy,
    path: "/rota",
  },
  {
    key: "requests",
    label: "Requests",
    icon: TreePalm,
    path: null,
    children: [
      {
        key: "leave-requests",
        label: "Leave Requests",
        path: "/requests/leave",
      },
      {
        key: "cash-advance",
        label: "Cash Advance",
        path: "/requests/cash-advance",
      },
    ],
  },
  {
    key: "transfers",
    label: "Transfers",
    icon: ArrowLeftRight,
    path: "/transfers",
  },
  {
    key: "expenses",
    label: "Expenses",
    icon: Banknote,
    path: "/expenses",
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessageSquare,
    path: "/chat",
  },
  {
    key: "instructions",
    label: "Instructions",
    icon: BookOpen,
    path: "/instructions",
  },
  {
    key: "training",
    label: "Training Videos",
    icon: Video,
    path: "/training",
  },
];

export default menuItems;

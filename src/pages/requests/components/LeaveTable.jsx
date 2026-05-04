import { memo, useMemo, useCallback } from "react";
import { Card, Dropdown, Table } from "antd";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import dayjs from "dayjs";
import LeaveStatusBadge from "./LeaveStatusBadge";
import LeaveTypeBadge from "./LeaveTypeBadge";

function LeaveTable({ leaves, onView, onEdit, onDelete, onReview }) {
  const getActions = useCallback((record) => {
    const items = [
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
      },
    ];

    if (record.status === "pending") {
      items.push({
        key: "review",
        label: "Review",
        icon: <CheckCircle2 size={14} />,
      });

      items.push({
        key: "edit",
        label: "Edit",
        icon: <Pencil size={14} />,
      });
    }

    items.push({ type: "divider" });

    items.push({
      key: "delete",
      label: "Remove",
      icon: <Trash2 size={14} />,
      danger: true,
    });

    return items;
  }, []);

  const handleMenuClick = useCallback(
    (record, { key }) => {
      if (key === "view") onView(record);
      if (key === "edit") onEdit(record);
      if (key === "delete") onDelete(record);
      if (key === "review") onReview(record);
    },
    [onView, onEdit, onDelete, onReview]
  );

  const columns = useMemo(
    () => [
      {
        title: "Staff",
        dataIndex: "staffName",
        key: "staffName",
        render: (name, record) => (
          <div>
            <p className="text-sm font-semibold text-text">{name}</p>
            <p className="text-xs text-text/50">{record.staffRole}</p>
          </div>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: (type) => <LeaveTypeBadge type={type} />,
      },
      {
        title: "Duration",
        key: "duration",
        render: (_, record) => (
          <div>
            <p className="text-sm text-text">
              {dayjs(record.startDate).format("MMM D")} -{" "}
              {dayjs(record.endDate).format("MMM D, YYYY")}
            </p>
            <p className="text-xs text-text/50">
              {record.days} {record.days === 1 ? "day" : "days"}
            </p>
          </div>
        ),
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        ellipsis: true,
        render: (reason) => (
          <span className="text-sm text-text/70">{reason}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => <LeaveStatusBadge status={status} />,
      },
      {
        title: "Submitted",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => (
          <span className="text-sm text-text/50">
            {dayjs(date).format("MMM D, YYYY")}
          </span>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 50,
        render: (_, record) => (
          <Dropdown
            menu={{
              items: getActions(record),
              onClick: (info) => handleMenuClick(record, info),
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button className="p-1 rounded-lg hover:bg-bg text-text/40 hover:text-text transition-all">
              <MoreHorizontal size={16} />
            </button>
          </Dropdown>
        ),
      },
    ],
    [getActions, handleMenuClick]
  );

  return (
    <Card className="border-border!">
      <Table
        columns={columns}
        dataSource={leaves}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} requests`,
        }}
        scroll={{ x: 900 }}
        locale={{
          emptyText: (
            <div className="py-12 text-center">
              <CalendarDaysIcon />
              <p className="text-sm text-text/50 mt-2">
                No leave requests found
              </p>
            </div>
          ),
        }}
      />
    </Card>
  );
}

function CalendarDaysIcon() {
  return (
    <div className="w-12 h-12 mx-auto rounded-2xl bg-bg flex items-center justify-center">
      <span className="text-text/30 text-xl">📋</span>
    </div>
  );
}

export default memo(LeaveTable);

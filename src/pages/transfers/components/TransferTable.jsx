import { memo, useMemo, useCallback } from "react";
import { Card, Dropdown, Table } from "antd";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader,
  RotateCcw,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import TransferStatusBadge from "./TransferStatusBadge";
import TransferTypeBadge from "./TransferTypeBadge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

const methodLabels = {
  "bank-transfer": "Bank Transfer",
  cash: "Cash",
  wallet: "E-Wallet",
};

function TransferTable({
  transfers,
  onView,
  onEdit,
  onDelete,
  onMarkCompleted,
  onMarkProcessing,
  onRetry,
  onFilterByStaff,
}) {
  const getActions = useCallback((record) => {
    const items = [
      {
        key: "view",
        label: "View Details",
        icon: <Eye size={14} />,
      },
      {
        key: "staffTransfers",
        label: "View Staff Transfers",
        icon: <User size={14} />,
      },
    ];

    if (record.status === "pending") {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <Pencil size={14} />,
      });
      items.push({
        key: "markProcessing",
        label: "Mark Processing",
        icon: <Loader size={14} />,
      });
    }

    if (record.status === "processing") {
      items.push({
        key: "markCompleted",
        label: "Mark Completed",
        icon: <CheckCircle2 size={14} />,
      });
    }

    if (record.status === "failed") {
      items.push({
        key: "retry",
        label: "Retry",
        icon: <RotateCcw size={14} />,
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
      if (key === "markCompleted") onMarkCompleted(record);
      if (key === "markProcessing") onMarkProcessing(record);
      if (key === "retry") onRetry(record);
      if (key === "staffTransfers") onFilterByStaff(record.staffId);
    },
    [
      onView,
      onEdit,
      onDelete,
      onMarkCompleted,
      onMarkProcessing,
      onRetry,
      onFilterByStaff,
    ]
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
        render: (type) => <TransferTypeBadge type={type} />,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount, record) => (
          <span
            className={`text-sm font-bold ${
              record.type === "deduction" ? "text-danger" : "text-text"
            }`}
          >
            {record.type === "deduction" ? "-" : ""}
            {formatCurrency(amount)}
          </span>
        ),
      },
      {
        title: "Method",
        dataIndex: "method",
        key: "method",
        render: (method) => (
          <span className="text-sm text-text/70">
            {methodLabels[method] || method}
          </span>
        ),
      },
      {
        title: "Reference",
        dataIndex: "reference",
        key: "reference",
        render: (ref) => (
          <span className="text-xs font-mono text-text/60 bg-bg px-2 py-1 rounded-lg">
            {ref}
          </span>
        ),
      },
      {
        title: "Month",
        dataIndex: "month",
        key: "month",
        render: (month) => (
          <span className="text-sm text-text/70">
            {dayjs(month).format("MMM YYYY")}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => <TransferStatusBadge status={status} />,
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
        dataSource={transfers}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} transfers`,
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
}

export default memo(TransferTable);

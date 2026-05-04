import { memo, useMemo, useCallback } from "react";
import { Card, Dropdown, Table } from "antd";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import dayjs from "dayjs";
import AdvanceStatusBadge from "./AdvanceStatusBadge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

const repaymentLabels = {
  "salary-deduction": "Salary Deduction",
  installments: "Installments",
  "one-time": "One-Time",
};

function AdvanceTable({
  advances,
  onView,
  onEdit,
  onDelete,
  onReview,
  onMarkPaid,
}) {
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

    if (record.status === "approved") {
      items.push({
        key: "markPaid",
        label: "Mark as Paid",
        icon: <Wallet size={14} />,
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
      if (key === "markPaid") onMarkPaid(record);
    },
    [onView, onEdit, onDelete, onReview, onMarkPaid]
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
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => (
          <span className="text-sm font-bold text-text">
            {formatCurrency(amount)}
          </span>
        ),
      },
      {
        title: "Repayment",
        dataIndex: "repaymentMethod",
        key: "repaymentMethod",
        render: (method) => (
          <span className="text-sm text-text/70">
            {repaymentLabels[method] || method}
          </span>
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
        render: (status) => <AdvanceStatusBadge status={status} />,
      },
      {
        title: "Requested",
        dataIndex: "requestedAt",
        key: "requestedAt",
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
        dataSource={advances}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} requests`,
        }}
        scroll={{ x: 900 }}
      />
    </Card>
  );
}

export default memo(AdvanceTable);

import { memo, useMemo, useCallback } from "react";
import { Table, Avatar, Dropdown, Button } from "antd";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffStatusBadge from "./StaffStatusBadge";

// Static pagination config - never re-created
const paginationConfig = {
  pageSize: 10,
  showSizeChanger: false,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} staff`,
};

// Memoized row actions component to prevent re-creating menu items
const RowActions = memo(function RowActions({
  record,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      {
        key: "profile",
        icon: <ExternalLink size={14} />,
        label: "View Profile",
        onClick: () => navigate(`/staff/${record.id}`),
      },
      {
        key: "view",
        icon: <Eye size={14} />,
        label: "View Details",
        onClick: () => onView(record),
      },
      {
        key: "edit",
        icon: <Pencil size={14} />,
        label: "Edit",
        onClick: () => onEdit(record),
      },
      { type: "divider" },
      {
        key: "toggle",
        icon:
          record.status === "active" ? (
            <UserX size={14} />
          ) : (
            <UserCheck size={14} />
          ),
        label: record.status === "active" ? "Deactivate" : "Activate",
        onClick: () => onToggleStatus(record),
      },
      { type: "divider" },
      {
        key: "delete",
        icon: <Trash2 size={14} />,
        label: "Delete",
        danger: true,
        onClick: () => onDelete(record),
      },
    ],
    [record, onView, onEdit, onDelete, onToggleStatus]
  );

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreHorizontal size={18} className="text-text/50" />}
        className="flex items-center justify-center"
      />
    </Dropdown>
  );
});

const StaffTable = memo(function StaffTable({
  data,
  loading,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  // Memoize columns - only recreate if action handlers change
  const columns = useMemo(
    () => [
      {
        title: "Staff Member",
        dataIndex: "name",
        key: "name",
        render: (name, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={38}
              style={{
                backgroundColor: "#84B067",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <div>
              <p className="text-text text-sm font-medium leading-tight">
                {name}
              </p>
              <p className="text-text/50 text-xs leading-tight mt-0.5">
                {record.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        responsive: ["md"],
        render: (role) => <span className="text-text text-sm">{role}</span>,
      },
      {
        title: "Department",
        dataIndex: "department",
        key: "department",
        responsive: ["lg"],
        render: (dept) => <span className="text-text/70 text-sm">{dept}</span>,
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        responsive: ["xl"],
        render: (phone) => (
          <span className="text-text/70 text-sm">{phone}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => <StaffStatusBadge status={status} />,
      },
      {
        title: "",
        key: "actions",
        width: 50,
        render: (_, record) => (
          <RowActions
            record={record}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onToggleStatus]
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={paginationConfig}
      scroll={{ x: 600 }}
    />
  );
});

export default StaffTable;

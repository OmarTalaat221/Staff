import { memo, useMemo } from "react";
import { Table, Button, Dropdown } from "antd";
import { MoreHorizontal, Play, Eye, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const RotaTable = memo(function RotaTable({ 
  data, 
  loading, 
  onApply 
}) {
  const navigate = useNavigate();

  const columns = useMemo(() => [
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar size={18} />
          </div>
          <span className="font-medium text-text">{name}</span>
        </div>
      )
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span className="text-text/60 text-sm">
          {dayjs(date).format("MMM D, YYYY HH:mm")}
        </span>
      )
    },
    {
      title: "Items Count",
      dataIndex: "items_count",
      key: "items_count",
      render: (count) => (
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-text/70">
          {count} Items
        </span>
      )
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: "view",
            icon: <Eye size={14} />,
            label: "View Details",
            onClick: () => navigate(`/rota/${record.id}`),
          },
          {
            key: "apply",
            icon: <Play size={14} />,
            label: "Apply Template",
            onClick: () => onApply(record),
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<MoreHorizontal size={18} className="text-text/50" />}
              className="flex items-center justify-center"
            />
          </Dropdown>
        );
      }
    }
  ], [onApply, navigate]);

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 600 }}
    />
  );
});

export default RotaTable;

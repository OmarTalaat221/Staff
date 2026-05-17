import { memo } from "react";
import { Button } from "antd";
import { UserPlus, Users, UserCheck, TreePalm, UserX } from "lucide-react";
import useStaffPage from "./useStaffPage";
import StaffFilters from "./components/StaffFilters";
import StaffTable from "./components/StaffTable";
import StaffDrawer from "./components/StaffDrawer";
import StaffViewModal from "./components/StaffViewModal";
import StaffDeleteModal from "./components/StaffDeleteModal";
import Loader from "../../shared/components/loader";


const statCards = [
  {
    key: "total",
    label: "Total Staff",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    key: "active",
    label: "Active",
    icon: UserCheck,
    color: "bg-success/10 text-success",
  },
  {
    key: "onLeave",
    label: "On Leave",
    icon: TreePalm,
    color: "bg-warning/10 text-warning",
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: UserX,
    color: "bg-danger/10 text-danger",
  },
];


const StatsGrid = memo(function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-text/60 text-xs">{card.label}</p>
              <p className="text-text text-xl font-bold">{stats[card.key]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default function StaffList() {
  const {
    staff,
    stats,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    filterDepartment,
    setFilterDepartment,
    filterStatus,
    setFilterStatus,
    clearFilters,
    hasActiveFilters,
    drawerOpen,
    drawerMode,
    editingStaff,
    drawerLoading,
    openAddDrawer,
    openEditDrawer,
    closeDrawer,
    handleDrawerSubmit,
    viewModalOpen,
    viewingStaff,
    openViewModal,
    closeViewModal,
    deleteModalOpen,
    deletingStaff,
    deleteLoading,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    toggleStatus,
  } = useStaffPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-text text-2xl font-bold">Staff Management</h1>
          <p className="text-text/60 text-sm mt-1">
            Manage your restaurant team members
          </p>
        </div>
        <Button
          type="primary"
          icon={<UserPlus size={18} />}
          onClick={openAddDrawer}
          size="large"
          className="font-medium"
        >
          Add Staff
        </Button>
      </div>

      {/* Stats - memoized separately */}
      <StatsGrid stats={stats} />

      {/* Filters + Table */}
      <div className="bg-surface border border-border rounded-2xl">
        <div className="p-4 sm:p-5 border-b border-border">
          <StaffFilters
            search={search}
            setSearch={setSearch}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterDepartment={filterDepartment}
            setFilterDepartment={setFilterDepartment}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <StaffTable
          data={staff}
          onView={openViewModal}
          onEdit={openEditDrawer}
          onDelete={openDeleteModal}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Modals & Drawer - only render when needed */}
      {drawerOpen && (
        <StaffDrawer
          open={drawerOpen}
          mode={drawerMode}
          editingStaff={editingStaff}
          loading={drawerLoading}
          onClose={closeDrawer}
          onSubmit={handleDrawerSubmit}
        />
      )}

      {viewModalOpen && (
        <StaffViewModal
          open={viewModalOpen}
          staff={viewingStaff}
          onClose={closeViewModal}
        />
      )}

      {deleteModalOpen && (
        <StaffDeleteModal
          open={deleteModalOpen}
          staff={deletingStaff}
          loading={deleteLoading}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

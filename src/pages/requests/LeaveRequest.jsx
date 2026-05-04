import { CalendarDays, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Button } from "antd";
// import useLeaveRequests from "./useLeaveRequests";
import LeaveFilters from "./components/LeaveFilters";
import LeaveTable from "./components/LeaveTable";
import LeaveDrawer from "./components/LeaveDrawer";
import LeaveViewModal from "./components/LeaveViewModal";
import LeaveDeleteModal from "./components/LeaveDeleteModal";
import LeaveReviewModal from "./components/LeaveReviewModal";
import useLeaveRequests from "./useLeaveRequest";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text/50 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function LeaveRequest() {
  const {
    leaves,
    stats,
    leaveTypes,
    staffMembers,

    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    hasActiveFilters,
    handleClearFilters,

    drawerOpen,
    editLeave,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitLeave,

    viewModalOpen,
    viewLeave,
    handleViewLeave,
    handleCloseView,

    deleteModalOpen,
    deleteLeave,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    reviewModalOpen,
    reviewLeave,
    reviewLoading,
    handleOpenReview,
    handleCloseReview,
    handleReviewAction,
  } = useLeaveRequests();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Leave Requests</h1>
          <p className="text-sm text-text/50 mt-1">
            Manage and review staff leave requests
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
          className="flex items-center gap-2"
          style={{ height: 44 }}
        >
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={CalendarDays}
          label="Total Requests"
          value={stats.total}
          color="#2563EB"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          color="#D97706"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          color="#16A34A"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="#DC2626"
        />
        <StatCard
          icon={CalendarDays}
          label="Approved Days"
          value={stats.totalDays}
          color="#0F766E"
        />
      </div>

      {/* Filters */}
      <LeaveFilters
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        leaveTypes={leaveTypes}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <LeaveTable
        leaves={leaves}
        onView={handleViewLeave}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onReview={handleOpenReview}
      />

      {/* Drawer */}
      {drawerOpen && (
        <LeaveDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          onSubmit={handleSubmitLeave}
          editLeave={editLeave}
          loading={drawerLoading}
          leaveTypes={leaveTypes}
          staffMembers={staffMembers}
        />
      )}

      {/* View Modal */}
      {viewModalOpen && (
        <LeaveViewModal
          open={viewModalOpen}
          onClose={handleCloseView}
          leave={viewLeave}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <LeaveDeleteModal
          open={deleteModalOpen}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          leave={deleteLeave}
          loading={deleteLoading}
        />
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <LeaveReviewModal
          open={reviewModalOpen}
          onClose={handleCloseReview}
          onAction={handleReviewAction}
          leave={reviewLeave}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}

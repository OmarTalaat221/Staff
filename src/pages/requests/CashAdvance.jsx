import { DollarSign, Clock, CheckCircle2, Wallet, Plus } from "lucide-react";
import { Button } from "antd";
import useCashAdvance from "./useCashAdvance";
import AdvanceFilters from "./components/AdvanceFilters";
import AdvanceTable from "./components/AdvanceTable";
import AdvanceDrawer from "./components/AdvanceDrawer";
import AdvanceViewModal from "./components/AdvanceViewModal";
import AdvanceDeleteModal from "./components/AdvanceDeleteModal";
import AdvanceReviewModal from "./components/AdvanceReviewModal";

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);

export default function CashAdvance() {
  const {
    advances,
    stats,
    repaymentMethods,
    staffMembers,

    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterMethod,
    setFilterMethod,
    hasActiveFilters,
    handleClearFilters,

    drawerOpen,
    editAdvance,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitAdvance,

    viewModalOpen,
    viewAdvance,
    handleViewAdvance,
    handleCloseView,

    deleteModalOpen,
    deleteAdvance,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,

    reviewModalOpen,
    reviewAdvance,
    reviewLoading,
    handleOpenReview,
    handleCloseReview,
    handleReviewAction,

    handleMarkPaid,
  } = useCashAdvance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Cash Advance</h1>
          <p className="text-sm text-text/50 mt-1">
            Manage staff cash advance requests and payments
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          label="Total Requests"
          value={stats.total}
          color="#84B067"
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
          icon={Wallet}
          label="Total Approved"
          value={formatCurrency(stats.approvedAmount)}
          color="#0F766E"
        />
      </div>

      {/* Filters */}
      <AdvanceFilters
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterMethod={filterMethod}
        onMethodChange={setFilterMethod}
        repaymentMethods={repaymentMethods}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <AdvanceTable
        advances={advances}
        onView={handleViewAdvance}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onReview={handleOpenReview}
        onMarkPaid={handleMarkPaid}
      />

      {/* Drawer */}
      {drawerOpen && (
        <AdvanceDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          onSubmit={handleSubmitAdvance}
          editAdvance={editAdvance}
          loading={drawerLoading}
          repaymentMethods={repaymentMethods}
          staffMembers={staffMembers}
        />
      )}

      {/* View Modal */}
      {viewModalOpen && (
        <AdvanceViewModal
          open={viewModalOpen}
          onClose={handleCloseView}
          advance={viewAdvance}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <AdvanceDeleteModal
          open={deleteModalOpen}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          advance={deleteAdvance}
          loading={deleteLoading}
        />
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <AdvanceReviewModal
          open={reviewModalOpen}
          onClose={handleCloseReview}
          onAction={handleReviewAction}
          advance={reviewAdvance}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}

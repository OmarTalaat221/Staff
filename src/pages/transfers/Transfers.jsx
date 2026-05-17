import { useState } from "react";
import { ArrowLeftRight, FileSpreadsheet } from "lucide-react";
import {
  ArrowLeftRight as TransferIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Banknote,
  Plus,
  X,
} from "lucide-react";
import { Button } from "antd";
import useTransfers from "./useTransfers";
import TransferFilters from "./components/TransferFilters";
import TransferTable from "./components/TransferTable";
import TransferDrawer from "./components/TransferDrawer";
import TransferViewModal from "./components/TransferViewModal";
import TransferDeleteModal from "./components/TransferDeleteModal";
import SettlementsTabContent from "./settlements/SettlementsTabContent";



const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);



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



const TABS = [
  { key: "transfers", label: "Transfers", icon: ArrowLeftRight },
  { key: "settlements", label: "Settlements", icon: FileSpreadsheet },
];



export default function Transfers() {
  const [activeTab, setActiveTab] = useState("transfers");

  const {
    transfers,
    stats,
    transferTypes,
    paymentMethods,
    staffMembers,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterType,
    handleFilterByType,
    filterMethod,
    setFilterMethod,
    filterStaffId,
    filteredStaffMember,
    handleFilterByStaff,
    hasActiveFilters,
    handleClearFilters,
    drawerOpen,
    editTransfer,
    drawerLoading,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseDrawer,
    handleSubmitTransfer,
    viewModalOpen,
    viewTransfer,
    handleViewTransfer,
    handleCloseView,
    deleteModalOpen,
    deleteTransfer,
    deleteLoading,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
    handleMarkCompleted,
    handleMarkProcessing,
    handleRetry,
  } = useTransfers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Transfers</h1>
          <p className="text-sm text-text/50 mt-1">
            Manage salaries, bonuses, advances, deductions and reimbursements
          </p>
        </div>

        {activeTab === "transfers" && (
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleOpenAdd}
            className="flex items-center gap-2"
            style={{ height: 44 }}
          >
            New Transfer
          </Button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${active
                  ? "border-primary text-primary"
                  : "border-transparent text-text/50 hover:text-text hover:border-border"
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1 — Transfers (unchanged content) */}
      {activeTab === "transfers" && (
        <>
          {/* Staff filter banner */}
          {filteredStaffMember && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {filteredStaffMember.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    Showing transfers for {filteredStaffMember.name}
                  </p>
                  <p className="text-xs text-text/50">
                    {filteredStaffMember.role}
                  </p>
                </div>
              </div>
              <Button
                size="small"
                icon={<X size={14} />}
                onClick={() => handleFilterByStaff(null)}
                className="flex items-center gap-1"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
            <StatCard
              icon={TransferIcon}
              label="Total"
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
              label="Completed"
              value={stats.completed}
              color="#16A34A"
            />
            <StatCard
              icon={AlertTriangle}
              label="Failed"
              value={stats.failed}
              color="#DC2626"
            />
            <StatCard
              icon={DollarSign}
              label="Total Paid"
              value={formatCurrency(stats.totalPaid)}
              color="#0F766E"
            />
            <StatCard
              icon={TrendingDown}
              label="Deductions"
              value={formatCurrency(stats.totalDeductions)}
              color="#7C3AED"
            />
            <StatCard
              icon={Banknote}
              label="Advances"
              value={formatCurrency(stats.totalAdvances)}
              color="#D97706"
            />
          </div>

          {/* Filters */}
          <TransferFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterType={filterType}
            onTypeChange={handleFilterByType}
            filterMethod={filterMethod}
            onMethodChange={setFilterMethod}
            filterStaffId={filterStaffId}
            onStaffChange={handleFilterByStaff}
            transferTypes={transferTypes}
            paymentMethods={paymentMethods}
            staffMembers={staffMembers}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Table */}
          <TransferTable
            transfers={transfers}
            loading={loading}
            onView={handleViewTransfer}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onMarkCompleted={handleMarkCompleted}
            onMarkProcessing={handleMarkProcessing}
            onRetry={handleRetry}
            onFilterByStaff={handleFilterByStaff}
          />

          {/* Drawer */}
          {drawerOpen && (
            <TransferDrawer
              open={drawerOpen}
              onClose={handleCloseDrawer}
              onSubmit={handleSubmitTransfer}
              editTransfer={editTransfer}
              loading={drawerLoading}
              transferTypes={transferTypes}
              paymentMethods={paymentMethods}
              staffMembers={staffMembers}
            />
          )}

          {/* View Modal */}
          {viewModalOpen && (
            <TransferViewModal
              open={viewModalOpen}
              onClose={handleCloseView}
              transfer={viewTransfer}
            />
          )}

          {/* Delete Modal */}
          {deleteModalOpen && (
            <TransferDeleteModal
              open={deleteModalOpen}
              onClose={handleCloseDelete}
              onConfirm={handleConfirmDelete}
              transfer={deleteTransfer}
              loading={deleteLoading}
            />
          )}
        </>
      )}

      {/* Tab 2 — Settlements */}
      {activeTab === "settlements" && <SettlementsTabContent />}
    </div>
  );
}

import {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getTransfers, addTransfer, deleteTransfer as deleteTransferApi } from "../../features/Transfers/transfersService";
import { getAllStaff } from "../../features/Staff/staffService";

const TRANSFER_TYPES = [
  { value: "salary", label: "Salary" },
  { value: "bonus", label: "Bonus" },
  { value: "advance", label: "Cash Advance" },
  { value: "deduction", label: "Deduction" },
  { value: "reimbursement", label: "Reimbursement" },
];

const PAYMENT_METHODS = [
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "E-Wallet" },
];

const apiTypeToUi = (type) => {
  if (!type) return "salary";
  const t = type.toLowerCase();
  if (t === "salary") return "salary";
  if (t === "bonus") return "bonus";
  if (t === "advance" || t === "cash advance" || t === "cash_advance") return "advance";
  if (t === "deduction") return "deduction";
  if (t === "reimbursement") return "reimbursement";
  return t;
};

const apiMethodToUi = (method) => {
  if (!method) return "cash";
  const m = method.toLowerCase();
  if (m === "cash") return "cash";
  if (m === "bank transfer" || m === "bank-transfer" || m === "bank_transfer") return "bank-transfer";
  if (m === "e-wallet" || m === "wallet" || m === "e_wallet") return "wallet";
  return m;
};

const apiStatusToUi = (status) => {
  if (!status) return "pending";
  return status.toLowerCase();
};

const uiTypeToApi = (type) => {
  if (type === "salary") return "Salary";
  if (type === "bonus") return "Bonus";
  if (type === "advance") return "Cash Advance";
  if (type === "deduction") return "Deduction";
  if (type === "reimbursement") return "Reimbursement";
  return type;
};

const uiMethodToApi = (method) => {
  if (method === "cash") return "Cash";
  if (method === "bank-transfer") return "Bank Transfer";
  if (method === "wallet") return "E-Wallet";
  return method;
};

const mapApiTransferToUi = (item) => ({
  id: Number(item.transfer_id),
  staffId: Number(item.employee_id),
  staffName: item.full_name || "Unknown",
  staffRole: item.role || "Staff",
  type: apiTypeToUi(item.type),
  amount: Number(item.amount),
  method: apiMethodToUi(item.method),
  reference: item.reference || `TXN-${item.transfer_id}`,
  month: item.transfer_month,
  status: apiStatusToUi(item.status),
  note: item.notes || "",
  createdAt: item.created_at ? item.created_at.split(" ")[0] : "",
  completedAt: item.status?.toLowerCase() === "completed" ? (item.created_at ? item.created_at.split(" ")[0] : "") : null,
  attachment: item.attachment || null,
});

export default function useTransfers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transfers, setTransfers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStaffId, setFilterStaffId] = useState(null);

  const fetchTransfersAndStaff = async () => {
    setLoading(true);
    try {
      const [transfersRes, staffRes] = await Promise.all([
        getTransfers(),
        getAllStaff()
      ]);

      if (transfersRes.status === "success") {
        setTransfers(transfersRes.data.map(mapApiTransferToUi));
      } else {
        toast.error("Failed to load transfers");
      }

      if (staffRes && (staffRes.status === "success" || Array.isArray(staffRes.data))) {
        const list = Array.isArray(staffRes.data) ? staffRes.data : [];
        setStaffMembers(list.map(s => ({
          id: Number(s.employee_id),
          name: s.full_name,
          role: s.role || "Staff",
          salary: Number(s.salary || 0)
        })));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading transfers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfersAndStaff();
  }, []);

  useEffect(() => {
    const staffIdParam = searchParams.get("staffId");
    const typeParam = searchParams.get("type");

    if (staffIdParam) {
      const id = Number(staffIdParam);
      const staff = staffMembers.find((s) => s.id === id);
      if (staff) setFilterStaffId(id);
    }

    if (typeParam) {
      const validType = TRANSFER_TYPES.find((t) => t.value === typeParam);
      if (validType) setFilterType(typeParam);
    }
  }, [searchParams, staffMembers]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTransfer, setEditTransfer] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTransfer, setDeleteTransfer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredStaffMember = useMemo(() => {
    if (!filterStaffId) return null;
    return staffMembers.find((s) => s.id === filterStaffId) || null;
  }, [filterStaffId, staffMembers]);

  const filteredTransfers = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();

    return transfers.filter((transfer) => {
      const matchSearch =
        !searchLower ||
        transfer.staffName.toLowerCase().includes(searchLower) ||
        transfer.staffRole.toLowerCase().includes(searchLower) ||
        transfer.reference.toLowerCase().includes(searchLower) ||
        transfer.note.toLowerCase().includes(searchLower);

      const matchStatus = !filterStatus || transfer.status === filterStatus;
      const matchType = !filterType || transfer.type === filterType;
      const matchMethod = !filterMethod || transfer.method === filterMethod;
      const matchStaff = !filterStaffId || transfer.staffId === filterStaffId;

      return (
        matchSearch && matchStatus && matchType && matchMethod && matchStaff
      );
    });
  }, [
    transfers,
    deferredSearch,
    filterStatus,
    filterType,
    filterMethod,
    filterStaffId,
  ]);

  const stats = useMemo(() => {
    const sourceList = filterStaffId
      ? transfers.filter((t) => t.staffId === filterStaffId)
      : transfers;

    const total = sourceList.length;
    const pending = sourceList.filter((t) => t.status === "pending").length;
    const completed = sourceList.filter((t) => t.status === "completed").length;
    const failed = sourceList.filter((t) => t.status === "failed").length;

    const totalPaid = sourceList
      .filter(
        (t) =>
          t.status === "completed" &&
          (t.type === "salary" ||
            t.type === "bonus" ||
            t.type === "reimbursement")
      )
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDeductions = sourceList
      .filter((t) => t.type === "deduction")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalAdvances = sourceList
      .filter((t) => t.type === "advance")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      total,
      pending,
      completed,
      failed,
      totalPaid,
      totalDeductions,
      totalAdvances,
    };
  }, [transfers, filterStaffId]);

  const hasActiveFilters = !!(
    deferredSearch ||
    filterStatus ||
    filterType ||
    filterMethod ||
    filterStaffId
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus("");
    setFilterType("");
    setFilterMethod("");
    setFilterStaffId(null);
    setSearchParams({});
    toast("Filters cleared", { icon: "✓" });
  }, [setSearchParams]);

  const handleFilterByStaff = useCallback(
    (staffId) => {
      if (staffId) {
        setFilterStaffId(staffId);
        const params = { staffId: String(staffId) };
        if (filterType) params.type = filterType;
        setSearchParams(params);
      } else {
        setFilterStaffId(null);
        const params = {};
        if (filterType) params.type = filterType;
        setSearchParams(params);
      }
    },
    [setSearchParams, filterType]
  );

  const handleFilterByType = useCallback(
    (type) => {
      setFilterType(type);
      const params = {};
      if (filterStaffId) params.staffId = String(filterStaffId);
      if (type) params.type = type;
      setSearchParams(params);
    },
    [setSearchParams, filterStaffId]
  );

  const handleOpenAdd = useCallback(() => {
    setEditTransfer(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((transfer) => {
    setEditTransfer(transfer);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditTransfer(null);
  }, []);

  const handleSubmitTransfer = useCallback(
    async (values) => {
      setDrawerLoading(true);

      try {
        const formData = new FormData();
        formData.append("employee_id", String(values.staffId));
        formData.append("type", uiTypeToApi(values.type));
        formData.append("amount", String(values.amount));
        formData.append("method", uiMethodToApi(values.method));
        formData.append("transfer_month", dayjs(values.month).format("YYYY-MM"));
        formData.append("notes", values.note || "");


        const fileObj = values.image && values.image[0]?.originFileObj;
        if (fileObj) {
          formData.append("image", fileObj);
        }

        const res = await addTransfer(formData);
        if (res.status === "success") {
          toast.success("Transfer saved successfully");
          fetchTransfersAndStaff();
          handleCloseDrawer();
        } else {
          toast.error(res.message || "Failed to save transfer");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to save transfer");
      } finally {
        setDrawerLoading(false);
      }
    },
    [handleCloseDrawer]
  );

  const handleViewTransfer = useCallback((transfer) => {
    setViewTransfer(transfer);
    setViewModalOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewModalOpen(false);
    setViewTransfer(null);
  }, []);

  const handleOpenDelete = useCallback((transfer) => {
    setDeleteTransfer(transfer);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteTransfer(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);

    try {
      const res = await deleteTransferApi(deleteTransfer.id);
      if (res.status === "success") {
        toast.success(`Transfer has been removed`);
        fetchTransfersAndStaff();
        handleCloseDelete();
      } else {
        toast.error(res.message || "Failed to delete transfer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transfer");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTransfer, handleCloseDelete]);

  const handleMarkCompleted = useCallback(async (transfer) => {
    toast.info("Status updates are handled via API actions");
  }, []);

  const handleMarkProcessing = useCallback(async (transfer) => {
    toast.info("Status updates are handled via API actions");
  }, []);

  const handleRetry = useCallback(async (transfer) => {
    toast.info("Status updates are handled via API actions");
  }, []);

  return {
    transfers: filteredTransfers,
    stats,
    transferTypes: TRANSFER_TYPES,
    paymentMethods: PAYMENT_METHODS,
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
  };
}


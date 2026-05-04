import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

const initialStaff = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed@restaurant.com",
    phone: "+20 100 123 4567",
    role: "Waiter",
    department: "Service",
    status: "active",
    joinDate: "2024-01-15",
    salary: 5000,
    avatar: null,
  },
  {
    id: 2,
    name: "Sara Ali",
    email: "sara@restaurant.com",
    phone: "+20 101 234 5678",
    role: "Chef",
    department: "Kitchen",
    status: "active",
    joinDate: "2023-11-20",
    salary: 8000,
    avatar: null,
  },
  {
    id: 3,
    name: "Mohamed Youssef",
    email: "mohamed@restaurant.com",
    phone: "+20 102 345 6789",
    role: "Cashier",
    department: "Finance",
    status: "on-leave",
    joinDate: "2024-03-01",
    salary: 4500,
    avatar: null,
  },
  {
    id: 4,
    name: "Fatma Omar",
    email: "fatma@restaurant.com",
    phone: "+20 103 456 7890",
    role: "Waiter",
    department: "Service",
    status: "active",
    joinDate: "2024-02-10",
    salary: 5000,
    avatar: null,
  },
  {
    id: 5,
    name: "Khaled Mahmoud",
    email: "khaled@restaurant.com",
    phone: "+20 104 567 8901",
    role: "Chef",
    department: "Kitchen",
    status: "inactive",
    joinDate: "2023-06-05",
    salary: 7500,
    avatar: null,
  },
  {
    id: 6,
    name: "Nour Ibrahim",
    email: "nour@restaurant.com",
    phone: "+20 105 678 9012",
    role: "Host",
    department: "Service",
    status: "active",
    joinDate: "2024-04-18",
    salary: 4000,
    avatar: null,
  },
  {
    id: 7,
    name: "Omar Adel",
    email: "omar@restaurant.com",
    phone: "+20 106 789 0123",
    role: "Delivery",
    department: "Logistics",
    status: "active",
    joinDate: "2024-05-22",
    salary: 3500,
    avatar: null,
  },
  {
    id: 8,
    name: "Yara Mostafa",
    email: "yara@restaurant.com",
    phone: "+20 107 890 1234",
    role: "Manager",
    department: "Management",
    status: "active",
    joinDate: "2022-09-10",
    salary: 12000,
    avatar: null,
  },
];

export const ROLES = [
  "Waiter",
  "Chef",
  "Cashier",
  "Host",
  "Delivery",
  "Manager",
  "Cleaner",
];

export const DEPARTMENTS = [
  "Service",
  "Kitchen",
  "Finance",
  "Logistics",
  "Management",
];

export const STATUSES = ["active", "on-leave", "inactive"];

export default function useStaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingStaff, setEditingStaff] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // View
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState(null);

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtered
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        !search ||
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        member.phone.includes(search) ||
        member.role.toLowerCase().includes(search.toLowerCase());

      const matchesRole = !filterRole || member.role === filterRole;
      const matchesDepartment =
        !filterDepartment || member.department === filterDepartment;
      const matchesStatus = !filterStatus || member.status === filterStatus;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [staff, search, filterRole, filterDepartment, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s) => s.status === "active").length,
      onLeave: staff.filter((s) => s.status === "on-leave").length,
      inactive: staff.filter((s) => s.status === "inactive").length,
    };
  }, [staff]);

  // Drawer actions
  const openAddDrawer = useCallback(() => {
    setEditingStaff(null);
    setDrawerMode("add");
    setDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((record) => {
    setEditingStaff(record);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingStaff(null);
    setDrawerLoading(false);
  }, []);

  const handleDrawerSubmit = useCallback(
    async (values) => {
      setDrawerLoading(true);

      try {
        // Simulate API
        await new Promise((r) => setTimeout(r, 800));

        if (drawerMode === "add") {
          const newMember = {
            ...values,
            id: Date.now(),
            avatar: null,
          };
          setStaff((prev) => [newMember, ...prev]);

          toast.success(`${values.name} has been added successfully`);
        } else {
          setStaff((prev) =>
            prev.map((s) =>
              s.id === editingStaff.id ? { ...s, ...values } : s
            )
          );

          toast.success(`${values.name}'s info updated successfully`);
        }

        closeDrawer();
      } catch {
        toast.error(
          drawerMode === "add"
            ? "Failed to add staff member"
            : "Failed to update staff member"
        );
        setDrawerLoading(false);
      }
    },
    [drawerMode, editingStaff, closeDrawer]
  );

  // View
  const openViewModal = useCallback((record) => {
    setViewingStaff(record);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewModalOpen(false);
    setViewingStaff(null);
  }, []);

  // Delete
  const openDeleteModal = useCallback((record) => {
    setDeletingStaff(record);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeletingStaff(null);
    setDeleteLoading(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingStaff) return;

    setDeleteLoading(true);

    try {
      // Simulate API
      await new Promise((r) => setTimeout(r, 600));

      const deletedName = deletingStaff.name;

      setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
      closeDeleteModal();

      toast.success(`${deletedName} has been removed`);
    } catch {
      toast.error("Failed to delete staff member");
      setDeleteLoading(false);
    }
  }, [deletingStaff, closeDeleteModal]);

  // Status toggle
  const toggleStatus = useCallback((record) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    const label = newStatus === "active" ? "activated" : "deactivated";

    setStaff((prev) =>
      prev.map((s) => (s.id === record.id ? { ...s, status: newStatus } : s))
    );

    toast.success(`${record.name} has been ${label}`);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterRole(null);
    setFilterDepartment(null);
    setFilterStatus(null);

    toast("Filters cleared", {
      icon: "🔄",
      duration: 1500,
    });
  }, []);

  const hasActiveFilters =
    search || filterRole || filterDepartment || filterStatus;

  return {
    staff: filteredStaff,
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
  };
}

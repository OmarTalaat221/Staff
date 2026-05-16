import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllStaff, addStaff, updateStaff, deleteStaff, toggleEmployeeStatus } from "../../features/Staff/staffService";

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

export const STATUSES = ["Active", "On Leave", "Inactive"];

export default function useStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchData = async () => {
    try {

      const response = await getAllStaff();
      setStaff(response?.data?.map(item => ({
        id: item?.employee_id,
        name: item?.full_name,
        email: item?.email,
        phone: item?.phone,
        role: item?.role,
        department: item?.department,
        status: item?.status?.toLowerCase(),
        joinDate: item?.join_date,
        salary: item?.salary,
        password: item?.password,
        address: item?.address,
        
        avatar: null,
        salary_type: item?.salary_type,
      })));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
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
      active: staff.filter((s) => s?.status?.toLowerCase() === "active").length,
      onLeave: staff.filter((s) => s?.status?.toLowerCase() === "on leave").length,
      inactive: staff.filter((s) => s?.status?.toLowerCase() === "inactive").length,
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
        // await new Promise((r) => setTimeout(r, 800));

        if (drawerMode === "add") {
      
          const dataSend = {
            full_name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            password: values.password,
            role: values.role,
            department: values.department,
            salary_type: values.salary_type,
            salary: values.salary,
            join_date: values.join_date
          }

          const data = await addStaff(dataSend);
          if (data.status == "success") {
            toast.success(`${values.name} has been added successfully`);
            fetchData()
            closeDrawer();
          } else {
            toast.error(data.message);
          }
        } else {
          const dataSend = {
            full_name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            role: values.role,
            department: values.department,
            salary_type: values.salary_type,
            salary: values.salary,
            join_date: values.join_date,
            employee_id: editingStaff.id,
            status: values.status?.toLowerCase(),
          }

          if (values.password) {
            dataSend.password = values.password;
          }
          const data = await updateStaff(dataSend);
          if (data.status == "success") {
            toast.success(`${values.name} has been updated successfully`);
            fetchData()

            closeDrawer();
          } else {
            toast.error(data.message);
          }

          // setStaff((prev) =>
          //   prev.map((s) =>
          //     s.id === editingStaff.id ? { ...s, ...values } : s
          //   )
          // );
          setDrawerLoading(false);

          // toast.success(`${values.name}'s info updated successfully`);
        }

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
      const response = await deleteStaff(deletingStaff.id);
      
      if (response.status === "success") {
        const deletedName = deletingStaff.name;
        setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
        closeDeleteModal();
        toast.success(`${deletedName} has been removed`);
      } else {
        toast.error(response.message || "Failed to delete staff member");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete staff member");
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingStaff, closeDeleteModal]);

  // Status toggle
  const toggleStatus = useCallback(async (record) => {
    try {
      const response = await toggleEmployeeStatus(record.id);
      if (response.status === "success") {
        const newStatus = record.status === "active" ? "inactive" : "active";
        const label = newStatus === "active" ? "activated" : "deactivated";

        setStaff((prev) =>
          prev.map((s) => (s.id === record.id ? { ...s, status: newStatus } : s))
        );

        toast.success(`${record.name} has been ${label}`);
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
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

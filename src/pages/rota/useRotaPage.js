import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getRotaTemplates, addRota } from "../../features/Schedule/scheduleService";
import { getAllStaff } from "../../features/Staff/staffService";

export default function useRotaPage() {
  const [templates, setTemplates] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [templatesRes, staffRes] = await Promise.all([
        getRotaTemplates(),
        getAllStaff()
      ]);

      if (templatesRes.status === "success") {
        setTemplates(templatesRes.data);
      }

      if (staffRes && (staffRes.status === "success" || Array.isArray(staffRes.data))) {
        const staffList = Array.isArray(staffRes.data) ? staffRes.data : [];
        setStaffMembers(staffList.map(item => ({
          id: String(item.employee_id),
          name: item.full_name,
          role: item.role,
          department: item.department
        })));
      }
    } catch (error) {
      console.error("Rota Fetch Error:", error);
      toast.error(error.message || "Failed to fetch rota data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => setCreateModalOpen(false);

  const handleCreateRota = async (payload) => {
    setCreateLoading(true);
    try {
      const response = await addRota(payload);
      if (response.status === "success") {
        toast.success(response.message || "Rota template created successfully");
        closeCreateModal();
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to create template");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create template");
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    templates,
    staffMembers,
    loading,
    fetchTemplates,

    createModalOpen,
    createLoading,
    openCreateModal,
    closeCreateModal,
    handleCreateRota,
  };
}


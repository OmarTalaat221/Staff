import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getRotaTemplates, applyRotaTemplate, addRota } from "../../features/Schedule/scheduleService";
import { getAllStaff } from "../../features/Staff/staffService";

export default function useRotaPage() {
  const [templates, setTemplates] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);


  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);


  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);

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

  const openApplyModal = useCallback((template) => {
    setApplyingTemplate(template);
    setApplyModalOpen(true);
  }, []);

  const closeApplyModal = useCallback(() => {
    setApplyModalOpen(false);
    setApplyingTemplate(null);
    setApplyLoading(false);
  }, []);

  const handleApplyTemplate = useCallback(async (values) => {
    if (!applyingTemplate) return;
    setApplyLoading(true);
    try {
      const payload = {
        rota_id: applyingTemplate.id,
        month: values.month,
        year: values.year,
        new_rota_name: values.new_rota_name
      };
      const response = await applyRotaTemplate(payload);
      if (response.status === "success") {
        toast.success("Rota template applied successfully");
        closeApplyModal();
      } else {
        toast.error(response.message || "Failed to apply template");
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply template");
    } finally {
      setApplyLoading(false);
    }
  }, [applyingTemplate, closeApplyModal]);

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

    applyModalOpen,
    applyingTemplate,
    applyLoading,
    openApplyModal,
    closeApplyModal,
    handleApplyTemplate,
  };
}


import { useState, useMemo, useCallback, useDeferredValue, useEffect } from "react";
import { SOPS, ROLES, PRIORITIES } from "./data/sopsData";
import { getCategories, addCategory as addCategoryApi, addSOP as addSOPApi } from "../../features/Instructions/instructionsService";
import toast from "react-hot-toast";

const useInstructions = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [sopsList, setSopsList] = useState(SOPS);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [sopDrawerOpen, setSopDrawerOpen] = useState(false);
  const [sopLoading, setSopLoading] = useState(false);

  const deferredSearch = useDeferredValue(search);


  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getCategories();
      if (res.status === "success") {
        setCategories(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredSOPs = useMemo(() => {
    let result = [...sopsList];

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      result = result.filter(
        (sop) =>
          sop.title.toLowerCase().includes(q) ||
          sop.steps.some(
            (step) =>
              step.text.toLowerCase().includes(q) ||
              (step.note && step.note.toLowerCase().includes(q))
          ) ||
          (sop.tips && sop.tips.toLowerCase().includes(q))
      );
    }

    if (selectedRole) {
      result = result.filter(
        (sop) => sop.roles.includes(selectedRole) || sop.roles.includes("all")
      );
    }

    if (selectedCategory) {
      result = result.filter((sop) => sop.category === selectedCategory);
    }

    if (selectedPriority) {
      result = result.filter((sop) => sop.priority === selectedPriority);
    }

    return result;
  }, [deferredSearch, selectedRole, selectedCategory, selectedPriority, sopsList]);

  const stats = useMemo(() => {
    return {
      total: sopsList.length,
      critical: sopsList.filter((s) => s.priority === "critical").length,
      high: sopsList.filter((s) => s.priority === "high").length,
      normal: sopsList.filter((s) => s.priority === "normal").length,
      categories: categories.length,
    };
  }, [sopsList, categories]);

  const hasActiveFilters = useMemo(() => {
    return !!(search || selectedRole || selectedCategory || selectedPriority);
  }, [search, selectedRole, selectedCategory, selectedPriority]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSelectedRole(null);
    setSelectedCategory(null);
    setSelectedPriority(null);
  }, []);

  const handleToggleExpand = useCallback((id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(sopsList.map((s) => s.id));
  }, [sopsList]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

  const handleAddCategorySubmit = async (name) => {
    setCategoryLoading(true);
    try {
      const res = await addCategoryApi(name);
      if (res.status === "success") {
        toast.success("Category added successfully");
        fetchCategories();
        setCategoryModalOpen(false);
      } else {
        toast.error(res.message || "Failed to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddSOPSubmit = async (values) => {
    setSopLoading(true);
    try {
      const payload = {
        title: values.title,
        category_id: values.category_id,
        tips: values.tips || "",
        roles: values.roles,
        steps: values.steps.map(step => ({
          text: step.text,
          note: step.note || ""
        }))
      };

      const res = await addSOPApi(payload);
      if (res.status === "success") {
        toast.success("SOP added successfully");


        const categoryObj = categories.find(c => Number(c.category_id) === values.category_id);
        const newSop = {
          id: String(Date.now()),
          title: values.title,
          category: categoryObj ? categoryObj.category_key : "general",
          roles: values.roles,
          priority: "normal",
          steps: values.steps.map((step, idx) => ({
            id: `${Date.now()}-${idx}`,
            text: step.text,
            note: step.note || ""
          })),
          tips: values.tips || ""
        };

        setSopsList(prev => [newSop, ...prev]);
        setSopDrawerOpen(false);
      } else {
        toast.error(res.message || "Failed to add SOP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add SOP");
    } finally {
      setSopLoading(false);
    }
  };

  return {
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    filteredSOPs,
    stats,
    hasActiveFilters,
    handleClearFilters,
    expandedIds,
    handleToggleExpand,
    handleExpandAll,
    handleCollapseAll,
    roles: ROLES,
    categories,
    priorities: PRIORITIES,

    categoryModalOpen,
    setCategoryModalOpen,
    categoryLoading,
    handleAddCategorySubmit,

    sopDrawerOpen,
    setSopDrawerOpen,
    sopLoading,
    handleAddSOPSubmit
  };
};

export default useInstructions;


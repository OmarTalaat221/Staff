import { useState, useMemo, useCallback, useDeferredValue } from "react";
import { SOPS, ROLES, CATEGORIES, PRIORITIES } from "./data/sopsData";

const useInstructions = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  const deferredSearch = useDeferredValue(search);

  const filteredSOPs = useMemo(() => {
    let result = [...SOPS];

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
  }, [deferredSearch, selectedRole, selectedCategory, selectedPriority]);

  const stats = useMemo(() => {
    return {
      total: SOPS.length,
      critical: SOPS.filter((s) => s.priority === "critical").length,
      high: SOPS.filter((s) => s.priority === "high").length,
      normal: SOPS.filter((s) => s.priority === "normal").length,
      categories: CATEGORIES.length,
    };
  }, []);

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
    setExpandedIds(SOPS.map((s) => s.id));
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

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
    categories: CATEGORIES,
    priorities: PRIORITIES,
  };
};

export default useInstructions;

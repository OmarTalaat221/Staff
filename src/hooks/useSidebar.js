import { useState, useEffect, useCallback } from "react";

export default function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;

    if (width < 768) {
      setIsMobile(true);
      setCollapsed(true);
    } else if (width < 1024) {
      setIsMobile(false);
      setCollapsed(true);
    } else {
      setIsMobile(false);
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const toggleCollapse = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return {
    collapsed,
    mobileOpen,
    isMobile,
    toggleCollapse,
    closeMobile,
  };
}

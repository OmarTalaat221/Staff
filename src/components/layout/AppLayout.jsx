import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileDrawer from "./MobileDrawer";
import useSidebar from "../../hooks/useSidebar";

export default function AppLayout() {
  const { collapsed, mobileOpen, isMobile, toggleCollapse, closeMobile } =
    useSidebar();

  return (
    <div className="min-h-dvh bg-bg">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={closeMobile} />

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300
          ${isMobile ? "ml-0" : collapsed ? "ml-[72px]" : "ml-[260px]"}
        `}
      >
        <TopBar onMenuClick={toggleCollapse} />

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

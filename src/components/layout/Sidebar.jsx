import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../../utils/storage";
import SidebarMenu from "./SidebarMenu";
import logoSvg from "../../assets/svg/logo.svg";

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <aside
      className={`
        hidden md:flex flex-col fixed top-0 left-0 h-dvh z-30
        bg-surface border-r border-border transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Logo */}
      <div
        className={`
          flex items-center gap-3 h-16 border-b border-border shrink-0
          ${collapsed ? "justify-center px-3" : "px-5"}
        `}
      >
        <img src={logoSvg} alt="Logo" className="w-9 h-9" />
        {!collapsed && (
          <span className="text-text text-lg font-bold tracking-tight">
            RestroAdmin
          </span>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <SidebarMenu collapsed={collapsed} />
      </div>

      {/* Logout */}
      <div className="border-t border-border p-3 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`
            w-full flex items-center gap-3 rounded-xl py-2.5 transition-all cursor-pointer
            text-text/60 hover:text-danger hover:bg-danger/5
            ${collapsed ? "justify-center px-3" : "px-3"}
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

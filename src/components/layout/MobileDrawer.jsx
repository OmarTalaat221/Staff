import { Drawer } from "antd";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../../utils/storage";
import SidebarMenu from "./SidebarMenu";

const LOGO_URL =
  "https://res.cloudinary.com/dhebgz7qh/image/upload/v1767452496/y3replc9wmlnvwb7kjvo_hyo3u3.png";

export default function MobileDrawer({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    onClose();
    navigate("/login");
  };

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      width={280}
      closable={false}
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
    >
      <div className="flex flex-col h-full bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="NOUR MAISON"
              className="w-9 h-9 rounded-[10px] object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-text text-base font-bold tracking-tight">
                NOUR MAISON
              </span>
              <span className="text-text/40 text-[10px] font-medium tracking-widest uppercase">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text/40 hover:text-text transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarMenu collapsed={false} onItemClick={onClose} />
        </div>

        {/* Logout */}
        <div className="border-t border-border p-3 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text/60 hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
}

import { Menu, Search } from "lucide-react";
import { Avatar } from "antd";

export default function TopBar({ onMenuClick }) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-bg text-text/60 hover:text-text transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-bg rounded-xl px-3 py-2 w-64">
          <Search size={16} className="text-text/40" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text/40 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-px h-8 bg-border mx-1" />

        <button className="flex items-center gap-3 hover:bg-bg rounded-xl px-2 py-1.5 transition-colors cursor-pointer">
          <Avatar
            size={34}
            style={{
              backgroundColor: "#84B067",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            A
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-text text-sm font-semibold leading-tight">
              Admin
            </p>
            <p className="text-text/50 text-xs leading-tight">Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
}

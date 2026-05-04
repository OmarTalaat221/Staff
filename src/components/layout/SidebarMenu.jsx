import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import menuItems from "../../utils/menuItems";

export default function SidebarMenu({ collapsed, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubs, setOpenSubs] = useState([]);

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isSubActive = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.path);
  };

  const toggleSub = (key) => {
    setOpenSubs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  return (
    <nav className="flex flex-col gap-1 px-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path) || isSubActive(item);
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openSubs.includes(item.key);

        return (
          <div key={item.key}>
            <button
              onClick={() => {
                if (hasChildren) {
                  if (collapsed) {
                    handleNavigate(item.children[0].path);
                  } else {
                    toggleSub(item.key);
                  }
                } else {
                  handleNavigate(item.path);
                }
              }}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer
                ${collapsed ? "justify-center px-3 py-3" : "px-3 py-2.5"}
                ${
                  active
                    ? "bg-primary text-white"
                    : "text-text/70 hover:bg-bg hover:text-text"
                }
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />

              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>

                  {hasChildren && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </>
              )}
            </button>

            {hasChildren && !collapsed && isOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-border pl-3">
                {item.children.map((child) => {
                  const childActive = isActive(child.path);

                  return (
                    <button
                      key={child.key}
                      onClick={() => handleNavigate(child.path)}
                      className={`
                        w-full text-left text-sm py-2 px-3 rounded-lg transition-all cursor-pointer
                        ${
                          childActive
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-text/60 hover:text-text hover:bg-bg"
                        }
                      `}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

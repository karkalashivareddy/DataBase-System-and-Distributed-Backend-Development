import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Layers,
  Truck,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const NAV = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" }] },
  {
    group: "Inventory",
    items: [
      { to: "/medicines", label: "Medicines", icon: Pill, key: "medicines" },
      { to: "/batches", label: "Batches", icon: Layers, key: "batches" },
      { to: "/low-stock", label: "Low Stock", icon: Layers, key: "low-stock", soon: true },
      { to: "/expiry", label: "Expiry", icon: Layers, key: "expiry", soon: true },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/suppliers", label: "Suppliers", icon: Truck, key: "suppliers", soon: true },
      { to: "/purchases", label: "Purchases", icon: ShoppingCart, key: "purchases", soon: true },
      { to: "/sales", label: "Sales", icon: ShoppingBag, key: "sales", soon: true },
    ],
  },
  {
    group: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3, key: "analytics", soon: true },
      { to: "/reports", label: "Reports", icon: FileText, key: "reports", soon: true },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/users", label: "Users", icon: Users, key: "users", soon: true },
      { to: "/settings", label: "Settings", icon: Settings, key: "settings", soon: true },
    ],
  },
];

export default function Sidebar({ collapsed, open, onCloseMobile }) {
  const { user } = useAuth();
  const role = user?.role || "Administrator";

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onCloseMobile} aria-hidden="true" />}
      <aside
        className={`sidebar ${open ? "open" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar-brand">
          <div className="brand-logo">
            <LayoutDashboard size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">PharmaStock</span>
            <span className="brand-sub">Medicine Inventory</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.group}>
              <div className="nav-group-label">{group.group}</div>
              {group.items.map((item) =>
                item.soon ? (
                  <div className="nav-link disabled" key={item.to} title={collapsed ? item.label : undefined}>
                    <item.icon className="nav-icon" size={18} />
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-soon">Soon</span>
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={onCloseMobile}
                  >
                    <item.icon className="nav-icon" size={18} />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                )
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar avatar-sm">{user?.avatar || "SR"}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name || "Shiva Reddy"}</span>
              <span className="user-role">{role}</span>
            </div>
            <button className="icon-btn" aria-label="Logout" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

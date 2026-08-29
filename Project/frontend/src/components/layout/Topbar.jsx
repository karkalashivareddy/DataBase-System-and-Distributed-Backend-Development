import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  UserCircle,
  Settings,
  Pill,
  Truck,
  Layers,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getNotifications } from "../../data/dashboard";
import { medicines, suppliers } from "../../data/medicines";
import { batches } from "../../data/batches";
import { sales, purchases } from "../../data/transactions";
import { useDebounce } from "../../hooks";

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

const NOTIF_META = {
  low: { label: "Low stock", tone: "status-warning" },
  expiry: { label: "Near expiry", tone: "status-warning" },
  expired: { label: "Expired", tone: "status-danger" },
  system: { label: "System", tone: "status-info" },
  sale: { label: "Sale", tone: "status-success" },
  purchase: { label: "Purchase", tone: "status-success" },
};

const TITLES = {
  "/dashboard": "Dashboard",
  "/medicines": "Medicines",
  "/batches": "Batches",
  "/suppliers": "Suppliers",
  "/purchases": "Purchases",
  "/sales": "Sales",
  "/alerts": "Low Stock & Expiry Alerts",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/users": "Users",
  "/settings": "Settings",
  "/profile": "Profile",
};

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(userRef, () => setUserMenu(false));
  useClickOutside(searchRef, () => setSearchOpen(false));

  const notifs = getNotifications();
  const current = TITLES[location.pathname] || "PharmaStock";

  // Global search grouped results
  const q = debounced.trim().toLowerCase();
  const searchResults = q
    ? {
        medicines: medicines.filter((m) =>
          `${m.name} ${m.generic} ${m.category} ${m.manufacturer}`.toLowerCase().includes(q)
        ).slice(0, 4),
        suppliers: suppliers.filter((s) =>
          `${s.name} ${s.contact}`.toLowerCase().includes(q)
        ).slice(0, 3),
        batches: batches().filter((b) =>
          `${b.batchNo} ${b.medicineName}`.toLowerCase().includes(q)
        ).slice(0, 3),
        transactions: [
          ...sales().map((s) => ({ id: s.id, label: s.saleNo, sub: s.medicine, kind: "Sale" })),
          ...purchases().map((p) => ({ id: p.id, label: p.purchaseNo, sub: p.medicine, kind: "Purchase" })),
        ].filter((t) => `${t.label} ${t.sub} ${t.kind}`.toLowerCase().includes(q)).slice(0, 3),
      }
    : null;

  const hasResults =
    searchResults &&
    (searchResults.medicines.length ||
      searchResults.suppliers.length ||
      searchResults.batches.length ||
      searchResults.transactions.length);

  const goTo = (kind, id) => {
    setSearchOpen(false);
    setQuery("");
    if (kind === "medicine") navigate(`/medicines/${id}`);
    else if (kind === "supplier") navigate(`/suppliers?id=${id}`);
    else if (kind === "batch") navigate(`/batches?id=${id}`);
    else navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out", "You have been signed out.");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button className="topbar-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <Menu size={20} />
      </button>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span>PharmaStock</span>
        <ChevronRight className="sep" size={14} />
        <span className="breadcrumb-current">{current}</span>
      </nav>

      <div className="topbar-spacer" />

      {/* Global search */}
      <div className="global-search" ref={searchRef}>
        <button
          className="topbar-btn"
          style={{ background: "var(--surface)", width: "100%", justifyContent: "flex-start", padding: "0 14px", gap: 10 }}
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Open global search"
        >
          <Search size={17} />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search medicines, batches...</span>
        </button>
        {searchOpen && (
          <div className="global-search-results">
            <div className="search-input-wrap" style={{ padding: "0 6px 8px" }}>
              <span className="search-icon">
                <Search size={15} />
              </span>
              <input
                className="search-input"
                placeholder="Start typing..."
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {!searchResults && (
              <div className="search-group-label">Type to search across medicines, batches, suppliers &amp; transactions</div>
            )}
            {searchResults && !hasResults && <div className="search-group-label">No results found</div>}
            {searchResults?.medicines.length > 0 && (
              <>
                <div className="search-group-label">Medicines</div>
                {searchResults.medicines.map((m) => (
                  <div key={m.id} className="search-result-item" onClick={() => goTo("medicine", m.id)}>
                    <PillIcon />
                    <span>{m.name}</span>
                    <span className="sri-sub">{m.category}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults?.suppliers.length > 0 && (
              <>
                <div className="search-group-label">Suppliers</div>
                {searchResults.suppliers.map((s) => (
                  <div key={s.id} className="search-result-item" onClick={() => goTo("supplier", s.id)}>
                    <TruckIcon />
                    <span>{s.name}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults?.batches.length > 0 && (
              <>
                <div className="search-group-label">Batches</div>
                {searchResults.batches.map((b) => (
                  <div key={b.id} className="search-result-item" onClick={() => goTo("batch", b.id)}>
                    <LayersIcon />
                    <span>{b.batchNo} · {b.medicineName}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults?.transactions.length > 0 && (
              <>
                <div className="search-group-label">Transactions</div>
                {searchResults.transactions.map((t) => (
                  <div key={t.id} className="search-result-item" onClick={() => goTo("txn", t.id)}>
                    <DocIcon />
                    <span>{t.label}</span>
                    <span className="sri-sub">{t.kind}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{ position: "relative" }} ref={notifRef}>
        <button className="topbar-btn" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
          <Bell size={19} />
          <span className="notif-dot">{notifs.length}</span>
        </button>
        {notifOpen && (
          <div className="notif-panel">
            <div className="notif-header">
              <span>Notifications</span>
              <button className="icon-btn" onClick={() => setNotifOpen(false)} aria-label="Close notifications">
                <ChevronRight size={16} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>
            <div className="notif-list">
              {notifs.map((n) => {
                const meta = NOTIF_META[n.type] || NOTIF_META.system;
                return (
                  <div className="notif-item" key={n.id}>
                    <div className={`notif-type ${meta.tone}`}>
                      <NotifIcon type={n.type} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
                      <div className="muted text-sm">{n.message}</div>
                      <div className="muted text-sm" style={{ fontSize: 11.5, marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div style={{ position: "relative" }} ref={userRef}>
        <button className="topbar-user" onClick={() => setUserMenu((v) => !v)} aria-label="Account menu">
          <div className="topbar-user-meta">
            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.name || "Guest"}</span>
            <span className="muted text-sm">{user?.role || "—"}</span>
          </div>
          <div className="avatar">{user?.avatar || "U"}</div>
        </button>
        {userMenu && (
          <div className="menu-panel">
            <button className="menu-item" onClick={() => { setUserMenu(false); navigate("/profile"); }}>
              <UserCircle size={16} /> Profile
            </button>
            <button className="menu-item" onClick={() => { setUserMenu(false); navigate("/settings"); }}>
              <Settings size={16} /> Settings
            </button>
            <div className="divider" style={{ margin: "4px 10px" }} />
            <button className="menu-item danger" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function PillIcon() {
  return <span style={{ color: "var(--accent)" }}><Pill size={16} /></span>;
}
function TruckIcon() {
  return <span style={{ color: "var(--info)" }}><Truck size={16} /></span>;
}
function LayersIcon() {
  return <span style={{ color: "var(--warning)" }}><Layers size={16} /></span>;
}
function DocIcon() {
  return <span style={{ color: "var(--text-secondary)" }}><FileText size={16} /></span>;
}
function NotifIcon({ type }) {
  const map = {
    low: "⚠",
    expiry: "⏳",
    expired: "✕",
    system: "ℹ",
    sale: "✔",
    purchase: "＋",
  };
  return <span style={{ fontWeight: 700 }}>{map[type] || "•"}</span>;
}

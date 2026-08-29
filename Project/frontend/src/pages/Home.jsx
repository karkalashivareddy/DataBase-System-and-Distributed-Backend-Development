import { Pill, ShieldCheck, BarChart3, Package, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";

const PILLARS = [
  {
    icon: Package,
    title: "Batch-wise Inventory",
    desc: "Track stock by batch with full lot, count and purchase visibility.",
  },
  {
    icon: ShieldCheck,
    title: "Expiry & Low-Stock Alerts",
    desc: "Proactive alerts for near-expiry and reorder-level stock conditions.",
  },
  {
    icon: BarChart3,
    title: "Inventory Analytics",
    desc: "Visual dashboards and reports to support data-driven decisions.",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Ambient background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1000px 600px at 15% -5%, rgba(20,184,166,0.10), transparent 60%), radial-gradient(800px 500px at 90% 110%, rgba(34,211,238,0.06), transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "12%",
          right: "8%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "1px solid var(--border-strong)",
          background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.12), rgba(20,184,166,0.06) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "24px 40px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="brand-logo">
          <Pill size={22} />
        </div>
        <div>
          <div className="brand-name" style={{ fontSize: 20 }}>PharmaStock</div>
          <div className="brand-sub">Medicine Stock Management &amp; Analytics Portal</div>
        </div>
      </header>

      <main style={{ position: "relative", padding: "64px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <span className="status-badge status-success" style={{ marginBottom: 20 }}>
            <span className="dot" aria-hidden="true" />
            Project Foundation
          </span>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: 720, margin: "0 auto 16px" }}>
            Pharmaceutical Inventory Management, Reimagined
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 640, margin: "0 auto 32px" }}>
            A centralized stock management and analytics portal for pharmaceuticals — built for
            batch-wise tracking, expiry monitoring and data-driven decisions.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="ghost" size="lg" icon={BarChart3} disabled>
              Dashboard — coming in the next milestone
            </Button>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 24 }}>
          {PILLARS.map((p) => (
            <div className="card card-hover" key={p.title}>
              <div className="stat-icon" style={{ marginBottom: 14 }}>
                <p.icon size={20} />
              </div>
              <div className="card-title" style={{ marginBottom: 6 }}>{p.title}</div>
              <div className="card-sub">{p.desc}</div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
          <p>
            Medicine Stock Management &amp; Analytics Portal for Pharmaceuticals
            <br />
            KL UNIVERSITY · Database Systems Engineering &amp; Distributed Backend Development
          </p>
        </footer>
      </main>
    </div>
  );
}

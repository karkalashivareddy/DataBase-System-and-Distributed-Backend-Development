import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import StatusBadge from "../components/common/StatusBadge";
import { formatDate } from "../utils/formatters";

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) return null;

  const save = (e) => {
    e.preventDefault();
    toast.success("Profile saved", "Your profile details were updated.");
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="View and update your personal information and preferences." />

      <div className="detail-hero">
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>{user.avatar}</div>
        <div style={{ flex: 1 }}>
          <h1 className="ph-title" style={{ fontSize: 20, margin: 0 }}>{user.name}</h1>
          <p className="ph-sub" style={{ margin: "2px 0 0" }}>{user.email}</p>
        </div>
        <StatusBadge status="Active" />
      </div>

      <div className="spec-grid" style={{ marginBottom: 24 }}>
        <div className="spec-item"><div className="si-label">Role</div><div className="si-value">{user.role}</div></div>
        <div className="spec-item"><div className="si-label">Phone</div><div className="si-value">{user.phone}</div></div>
        <div className="spec-item"><div className="si-label">Joined</div><div className="si-value">{formatDate(user.joined)}</div></div>
        <div className="spec-item"><div className="si-label">User ID</div><div className="si-value">{user.id}</div></div>
      </div>

      <form className="card" style={{ maxWidth: 640 }} onSubmit={save}>
        <div className="card-header"><div><div className="card-title">Edit Details</div><div className="card-sub">Update your profile information.</div></div></div>
        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className="form-input" defaultValue={user.name} />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="form-input" type="email" defaultValue={user.email} />
          </div>
          <div className="field-group">
            <label className="field-label">Phone</label>
            <input className="form-input" defaultValue={user.phone} />
          </div>
          <div className="field-group">
            <label className="field-label">Role (read-only)</label>
            <input className="form-input" value={user.role} readOnly />
          </div>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 16, maxWidth: 640 }}>
        Security note: this is a frontend demo profile. Real authentication and authorization are enforced by the backend API with JWT.
      </p>
    </div>
  );
}

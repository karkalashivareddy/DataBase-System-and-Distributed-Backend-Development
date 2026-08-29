import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import LoadingState from "../components/common/LoadingState";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";
import * as api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { formatDate } from "../utils/formatters";
import { ROLES } from "../utils/constants";

export default function Users() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.getUsers().then(setItems);
  }, []);

  if (!items) return <LoadingState rows={4} />;

  const filtered = items.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );

  const invite = () => toast.info("Invite", "An invitation link has been generated (demo).");

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage team members, roles and access within PharmaStock."
      />

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search users..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" subtitle="Try a different search." />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex gap-12">
                        <div className="avatar avatar-sm">{u.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div className="cell-sub">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: "auto", minWidth: 160, padding: "5px 28px 5px 10px" }}
                        defaultValue={u.role}
                        onChange={() => toast.success("Role updated", `${u.name}'s role was updated.`)}
                        aria-label={`Role for ${u.name}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="text-muted">{u.phone}</td>
                    <td className="muted">{formatDate(u.joined)}</td>
                    <td><StatusBadge status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

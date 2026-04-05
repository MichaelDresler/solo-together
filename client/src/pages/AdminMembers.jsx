import { useCallback, useContext, useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { canAssignAdmins, canManageMembers } from "../lib/permissions";

export function AdminMembersSection() {
  const { token, user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/admin/members"), {
        headers: createAuthHeaders(token),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load members");
      }

      setMembers(data.members || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (canManageMembers(user)) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [loadMembers, user]);

  if (!canManageMembers(user)) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">You do not have permission to manage members.</p>
      </main>
    );
  }

  async function updateMemberRole(memberId, role) {
    const actionId = `role:${memberId}:${role}`;
    setActiveAction(actionId);
    setError("");

    try {
      const res = await fetch(getApiUrl(`/api/admin/members/${memberId}/role`), {
        method: "PATCH",
        headers: createAuthHeaders(token, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) => (member._id === memberId ? data.user : member))
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update role");
    } finally {
      setActiveAction("");
    }
  }

  async function updateMemberStatus(memberId, status) {
    const actionId = `status:${memberId}:${status}`;
    setActiveAction(actionId);
    setError("");

    try {
      const res = await fetch(getApiUrl(`/api/admin/members/${memberId}/status`), {
        method: "PATCH",
        headers: createAuthHeaders(token, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) => (member._id === memberId ? data.user : member))
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update status");
    } finally {
      setActiveAction("");
    }
  }

  async function deleteMember() {
    if (!pendingDelete) {
      return;
    }

    const { memberId } = pendingDelete;
    const actionId = `delete:${memberId}`;
    setActiveAction(actionId);
    setError("");

    try {
      const res = await fetch(getApiUrl(`/api/admin/members/${memberId}`), {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete member");
      }

      setMembers((currentMembers) =>
        currentMembers.filter((member) => member._id !== memberId)
      );
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete member");
    } finally {
      setActiveAction("");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-stone-900">Manage Members</h2>
        <p className="max-w-3xl text-sm text-stone-600">
          Review the member list, suspend accounts, delete accounts, and for the
          super user only, promote or demote admins.
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          Loading members...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {members.map((member) => {
                const isSelf = member._id === user?._id;
                const isSuper = member.role === "super_admin";

                return (
                  <tr key={member._id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-stone-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-stone-500">@{member.username}</p>
                        <p className="text-sm text-stone-500">{member.email || "No email set"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {canAssignAdmins(user) && !isSuper ? (
                        <select
                          value={member.role}
                          disabled={activeAction.startsWith(`role:${member._id}:`)}
                          onChange={(event) => updateMemberRole(member._id, event.target.value)}
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                        >
                          <option value="member">member</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className="text-sm font-medium text-stone-700">{member.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          member.status === "suspended"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSelf || isSuper || activeAction.startsWith(`status:${member._id}:`)}
                          onClick={() =>
                            updateMemberStatus(
                              member._id,
                              member.status === "active" ? "suspended" : "active"
                            )
                          }
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {member.status === "active" ? "Suspend" : "Activate"}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf || isSuper || activeAction === `delete:${member._id}`}
                          onClick={() =>
                            setPendingDelete({
                              memberId: member._id,
                              username: member.username,
                            })
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {activeAction === `delete:${member._id}` ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete member?"
        message={`Delete @${pendingDelete?.username || "member"}? Their account and internal events will be removed.`}
        confirmLabel="Delete"
        busy={Boolean(pendingDelete && activeAction === `delete:${pendingDelete.memberId}`)}
        onConfirm={deleteMember}
        onCancel={() => {
          if (!activeAction.startsWith("delete:")) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}

export default function AdminMembers() {
  const { user } = useContext(AuthContext);

  if (!canManageMembers(user)) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">You do not have permission to manage members.</p>
      </main>
    );
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-6xl">
        <AdminMembersSection />
      </div>
    </main>
  );
}

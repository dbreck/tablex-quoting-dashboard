"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  UserPlus,
  Trash2,
  KeyRound,
  AlertCircle,
  Check,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "contributor";
  created_at: string;
  last_sign_in_at: string | null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UsersClient() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "contributor">("contributor");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Clear invite message after 5 seconds
  useEffect(() => {
    if (inviteMessage) {
      const timer = setTimeout(() => setInviteMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [inviteMessage]);

  // Clear action message after 5 seconds
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMessage(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
    });

    const data = await res.json();

    if (res.ok) {
      setInviteMessage({ type: "success", text: data.message || "Invitation sent successfully" });
      setInviteEmail("");
      setInviteName("");
      setInviteRole("contributor");
      loadUsers();
    } else {
      setInviteMessage({ type: "error", text: data.error || "Failed to send invitation" });
    }

    setInviting(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionMessage(null);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await res.json();

    if (res.ok) {
      setActionMessage({ type: "success", text: "Role updated successfully" });
      loadUsers();
    } else {
      setActionMessage({ type: "error", text: data.error || "Failed to update role" });
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setDeleting(true);
    setActionMessage(null);

    const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      setActionMessage({ type: "success", text: "User deleted successfully" });
      loadUsers();
    } else {
      setActionMessage({ type: "error", text: data.error || "Failed to delete user" });
    }

    setDeleteUser(null);
    setDeleting(false);
  }

  async function handleResetPassword(userId: string) {
    setActionMessage(null);

    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      setActionMessage({ type: "success", text: data.message || "Password reset email sent" });
    } else {
      setActionMessage({ type: "error", text: data.error || "Failed to send reset email" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Invite and manage dashboard users</p>
      </div>

      {/* Invite User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-green" />
            Add User
          </CardTitle>
          <CardDescription>Create a new dashboard user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Input
              type="text"
              placeholder="Full name (optional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "contributor")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviting || !inviteEmail}>
              {inviting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </form>
          {inviteMessage && (
            <div className="mt-3">
              {inviteMessage.type === "success" ? (
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {inviteMessage.text}
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {inviteMessage.text}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-green" />
            Users
            <Badge variant="secondary" className="ml-1">
              {users.length}
            </Badge>
          </CardTitle>
          {actionMessage && (
            <div className="mt-2">
              {actionMessage.type === "success" ? (
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {actionMessage.text}
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {actionMessage.text}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-sm font-medium text-slate-500">
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrentUser = u.id === currentUserId;
                  return (
                    <tr key={u.id} className="text-sm">
                      <td className="px-4 py-3 text-slate-900">
                        <span className="flex items-center gap-2">
                          {u.full_name || "\u2014"}
                          {isCurrentUser && (
                            <Badge variant="info" className="text-[10px] px-1.5 py-0">
                              you
                            </Badge>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                          disabled={isCurrentUser}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Reset password"
                            disabled={isCurrentUser}
                            onClick={() => handleResetPassword(u.id)}
                          >
                            <KeyRound className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete user"
                            disabled={isCurrentUser}
                            onClick={() => setDeleteUser(u)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteUser?.full_name || deleteUser?.email}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

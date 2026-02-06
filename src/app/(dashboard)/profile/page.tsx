"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
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
import { Loader2, Check, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isAdmin, isLoading, refreshProfile } = useAuth();
  const supabase = createClient();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Populate form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!user) return;

    setSavingProfile(true);
    setProfileMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      setProfileMessage({ type: "error", text: error.message });
    } else {
      await refreshProfile();
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    }

    setSavingProfile(false);
  }

  async function handleUpdatePassword() {
    setSavingPassword(true);
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <div>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {profile?.role}
                </Badge>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {profileMessage.text}
              </div>
            )}

            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your login password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
              />
            </div>

            {passwordMessage && (
              <div
                className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {passwordMessage.text}
              </div>
            )}

            <Button onClick={handleUpdatePassword} disabled={savingPassword}>
              {savingPassword && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

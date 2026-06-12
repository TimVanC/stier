"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import {
  changePassword,
  deleteAccount,
  updateProfileSettings,
  uploadAvatar,
} from "@/lib/actions/profile";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { avatarPublicUrl } from "@/lib/db/profile-shared";
import type { PublicProfile } from "@/lib/db/profile-shared";

export function SettingsForm({
  profile,
  email,
}: {
  profile: PublicProfile;
  email: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate);
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const avatarUrl = avatarPublicUrl(profile.avatarUrl);

  function handleSaveProfile() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfileSettings({
        displayName,
        username,
        isPrivate,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Profile updated.");
      router.refresh();
    });
  }

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadAvatar(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Avatar updated.");
      router.refresh();
    });
  }

  function handlePasswordChange() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await changePassword({ newPassword });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewPassword("");
      setMessage("Password updated.");
    });
  }

  function handleDeleteAccount() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(deleteConfirm);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await signOut();
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-300/50 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-navy font-display text-xl font-bold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => fileRef.current?.click()}
            >
              Upload avatar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={isPending}
              className="size-4 rounded border-border"
            />
            Private profile (hide public profile page from others)
          </label>
          <Button type="button" onClick={handleSaveProfile} disabled={isPending}>
            Save profile
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Password</h2>
        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            placeholder="At least 8 characters"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePasswordChange}
            disabled={isPending || newPassword.length < 8}
          >
            Update password
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-card p-5">
        <h2 className="font-display text-lg font-bold text-destructive">
          Delete account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove your account and all associated data. This cannot
          be undone.
        </p>
        {!showDeleteModal ? (
          <Button
            type="button"
            variant="outline"
            className="mt-4 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={isPending || deleteConfirm !== "DELETE"}
                onClick={handleDeleteAccount}
              >
                Confirm deletion
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

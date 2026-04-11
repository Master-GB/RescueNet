import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Camera,
  Loader2,
  Mail,
  PencilLine,
  Save,
  ShieldCheck,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import adminSidebarItems from "./adminSidebarItems";
import useAuth from "../../hooks/useAuth";
import ProfileAvatar from "../../components/common/ProfileAvatar";
import AdminToastRegion from "../../components/admin/AdminToastRegion";
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_HELP_TEXT,
  validateProfileImageFile,
} from "../../utils/profileImageValidation";
import { updateAccountProfileImage } from "../../services/profileService";
import {
  deleteAdminProfile,
  getAdminProfile,
  updateAdminProfile,
} from "../../services/adminProfileService";

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
};

export default function AdminProfilePage() {
  const { user, refreshSession, logout } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [profileImageSaving, setProfileImageSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, createToast(type, title, message)]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const resetProfileImageSelection = useCallback(() => {
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(null);
    setProfileImagePreviewUrl("");
  }, [profileImagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

  const loadAdminProfile = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    setPageError("");

    try {
      const response = await getAdminProfile();
      const nextProfileData = response?.profileData || null;

      if (!nextProfileData) {
        const message = "Admin profile data is unavailable.";
        setPageError(message);
        addToast("error", "Profile load failed", message);
        return;
      }

      setProfileData(nextProfileData);
      setNameInput(nextProfileData.name || "");
    } catch (error) {
      const message = error.message || "Failed to load admin profile.";
      setPageError(message);
      addToast("error", "Profile load failed", message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadAdminProfile().catch(() => {});
  }, [loadAdminProfile]);

  const avatarFallbackText = useMemo(() => {
    const value = user?.name || profileData?.name || "A";
    return value.trim().slice(0, 1).toUpperCase() || "A";
  }, [profileData?.name, user?.name]);

  const resolvedProfileImageUrl = useMemo(() => {
    return (
      profileImagePreviewUrl
      || user?.profileImageUrl
      || profileData?.profileImageUrl
      || ""
    );
  }, [profileData?.profileImageUrl, profileImagePreviewUrl, user?.profileImageUrl]);

  const handleProfileImageSelection = useCallback((event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      resetProfileImageSelection();
      return;
    }

    const validationError = validateProfileImageFile(selectedFile);
    if (validationError) {
      resetProfileImageSelection();
      addToast("error", "Invalid image", validationError);
      return;
    }

    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(selectedFile);
    setProfileImagePreviewUrl(URL.createObjectURL(selectedFile));
  }, [addToast, profileImagePreviewUrl, resetProfileImageSelection]);

  const handleUploadProfileImage = useCallback(async () => {
    if (!(profileImageFile instanceof File)) {
      addToast("warning", "Image required", "Select a profile image before uploading.");
      return;
    }

    setProfileImageSaving(true);

    try {
      const response = await updateAccountProfileImage({ file: profileImageFile });
      await refreshSession();
      resetProfileImageSelection();
      await loadAdminProfile({ silent: true });
      addToast("success", "Profile image updated", response?.message || "Profile image updated successfully.");

      if (response?.warning) {
        addToast("warning", "Cloudinary cleanup warning", response.warning);
      }
    } catch (error) {
      addToast("error", "Upload failed", error.message || "Failed to upload profile image.");
    } finally {
      setProfileImageSaving(false);
    }
  }, [addToast, loadAdminProfile, profileImageFile, refreshSession, resetProfileImageSelection]);

  const handleRemoveProfileImage = useCallback(async () => {
    setProfileImageSaving(true);

    try {
      const response = await updateAccountProfileImage({ remove: true });
      await refreshSession();
      resetProfileImageSelection();
      await loadAdminProfile({ silent: true });
      addToast("success", "Profile image removed", response?.message || "Profile image removed successfully.");

      if (response?.warning) {
        addToast("warning", "Cloudinary cleanup warning", response.warning);
      }
    } catch (error) {
      addToast("error", "Remove failed", error.message || "Failed to remove profile image.");
    } finally {
      setProfileImageSaving(false);
    }
  }, [addToast, loadAdminProfile, refreshSession, resetProfileImageSelection]);

  const handleCancelNameEdit = useCallback(() => {
    setNameInput(profileData?.name || "");
    setIsEditingName(false);
  }, [profileData?.name]);

  const handleSaveName = useCallback(async () => {
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      addToast("warning", "Validation error", "Name cannot be empty.");
      return;
    }

    setIsSavingName(true);

    try {
      const response = await updateAdminProfile({ name: trimmedName });
      setProfileData(response?.profileData || profileData);
      setNameInput(response?.profileData?.name || trimmedName);
      setIsEditingName(false);
      await refreshSession();
      addToast("success", "Profile updated", response?.message || "Admin profile updated successfully.");
    } catch (error) {
      addToast("error", "Save failed", error.message || "Failed to update admin profile.");
    } finally {
      setIsSavingName(false);
    }
  }, [addToast, nameInput, profileData, refreshSession]);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);

    try {
      const response = await deleteAdminProfile();

      if (response?.warning) {
        addToast("warning", "Cloudinary cleanup warning", response.warning);
      }

      await logout({ redirectTo: "/auth/login" });
    } catch (error) {
      addToast("error", "Delete failed", error.message || "Failed to delete admin account.");
      setIsDeleting(false);
      return;
    }

    setIsDeleting(false);
  }, [addToast, logout]);

  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search users, approvals, and platform controls..."
      contentClassName="bg-auth-bg"
    >
      <section className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <header className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-auth-border bg-auth-bg px-3 py-2 text-auth-text-soft">
                <UserCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">Admin Account</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text-strong">Profile Settings</h1>
                <p className="mt-2 text-sm text-auth-text-soft">
                  Update your account name, manage your profile image, and control account deletion.
                </p>
              </div>
            </div>
          </div>
        </header>

        {pageError ? (
          <section className="rounded-xl border border-auth-danger-border bg-auth-danger-bg p-4 shadow-sm">
            <p className="text-sm font-semibold text-auth-text-strong">Unable to load profile data.</p>
            <p className="mt-1 text-sm text-auth-text-soft">{pageError}</p>
            <button
              type="button"
              onClick={() => loadAdminProfile()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
            >
              Retry
            </button>
          </section>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="h-[320px] animate-pulse rounded-2xl border border-auth-border bg-auth-surface" />
            <div className="h-[320px] animate-pulse rounded-2xl border border-auth-border bg-auth-surface" />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <ProfileAvatar
                  imageUrl={resolvedProfileImageUrl}
                  fallbackText={avatarFallbackText}
                  alt="Admin profile image"
                  wrapperClassName="h-28 w-28"
                  imageClassName="h-28 w-28 rounded-full border border-auth-border object-cover"
                  fallbackClassName="h-28 w-28 rounded-full border border-auth-border bg-auth-bg text-3xl font-bold text-auth-text-strong flex items-center justify-center"
                  fallbackIconClassName="h-8 w-8 text-auth-text-soft"
                />

                <div>
                  <p className="text-xl font-semibold text-auth-text-strong">{profileData?.name || user?.name || "Admin"}</p>
                  <p className="text-sm text-auth-text-soft">{profileData?.email || user?.email || "-"}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle">
                  <Camera className="h-4 w-4" />
                  Choose Image
                  <input
                    type="file"
                    accept={PROFILE_IMAGE_ACCEPT}
                    onChange={handleProfileImageSelection}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleUploadProfileImage}
                  disabled={profileImageSaving || !(profileImageFile instanceof File)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileImageSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Upload Image
                </button>

                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  disabled={profileImageSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-auth-danger-border bg-auth-danger-bg px-3 py-2 text-sm font-semibold text-auth-text-strong transition hover:bg-auth-danger-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileImageSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remove Image
                </button>

                <p className="text-xs text-auth-text-soft">{PROFILE_IMAGE_HELP_TEXT}</p>
                {profileImageFile ? (
                  <p className="text-xs text-auth-text-muted">Selected: {profileImageFile.name}</p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4">
              <article className="rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-auth-text-strong">Account Details</h2>
                <p className="mt-1 text-sm text-auth-text-soft">Admin profile details are scoped to account-level information.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Email</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-auth-text-strong">
                      <Mail className="h-4 w-4 text-auth-text-soft" />
                      {profileData?.email || user?.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Role</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-auth-text-strong">
                      <ShieldCheck className="h-4 w-4 text-auth-text-soft" />
                      {profileData?.role || user?.role || "ADMIN"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-auth-border bg-auth-bg p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Member Since</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-auth-text-strong">
                      <CalendarClock className="h-4 w-4 text-auth-text-soft" />
                      {formatDate(profileData?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-auth-border bg-auth-bg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Display Name</p>
                      {!isEditingName ? (
                        <p className="mt-2 text-lg font-semibold text-auth-text-strong">{profileData?.name || user?.name || "Admin"}</p>
                      ) : null}
                    </div>
                    {!isEditingName ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-auth-border bg-auth-surface px-3 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit Name
                      </button>
                    ) : null}
                  </div>

                  {isEditingName ? (
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(event) => setNameInput(event.target.value)}
                        maxLength={60}
                        className="w-full rounded-lg border border-auth-border bg-auth-surface px-3 py-2 text-sm text-auth-text-strong outline-none focus:border-primary"
                        placeholder="Enter your display name"
                      />

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelNameEdit}
                          disabled={isSavingName}
                          className="rounded-lg border border-auth-border bg-auth-surface px-3 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveName}
                          disabled={isSavingName}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Name
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>

              <article className="rounded-2xl border border-auth-danger-border bg-auth-danger-bg p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-auth-text-strong">Danger Zone</h2>
                <p className="mt-2 text-sm text-auth-text-soft">
                  Deleting your account is permanent. Your admin account and associated profile image will be removed.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Account
                </button>
              </article>
            </section>
          </div>
        )}
      </section>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-[1650] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-auth-danger-bg p-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-auth-text-strong">Delete Admin Account</h3>
                <p className="mt-2 text-sm text-auth-text-soft">
                  This action cannot be undone. You will be logged out immediately after account deletion.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-auth-border bg-auth-bg px-4 py-2 text-sm font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </span>
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminToastRegion toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}

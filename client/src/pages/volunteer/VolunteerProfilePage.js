import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import ProfileAvatar from "../../components/common/ProfileAvatar";
import VolunteerSectionHeader from "../../components/volunteerDashboard/VolunteerSectionHeader";
import {
  fetchVolunteerProfile,
  updateVolunteerAvailability,
} from "../../components/volunteerDashboard/volunteerDashboardApi";
import apiClient from "../../services/apiClient";
import { updateAccountProfileImage } from "../../services/profileService";
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_HELP_TEXT, validateProfileImageFile } from "../../utils/profileImageValidation";
import { volunteerSidebarItems } from "./volunteerLayoutConfig";

const toCsv = (value) => (Array.isArray(value) ? value.join(", ") : "");
const fromCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const VolunteerProfilePage = () => {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState("");
  const [districts, setDistricts] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("OFFLINE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [profileImageSaving, setProfileImageSaving] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchVolunteerProfile();
      const profileData = data?.profileData || null;
      setProfile(profileData);
      setSkills(toCsv(profileData?.skills));
      setDistricts(toCsv(profileData?.serviceDistricts));
      setAvailabilityStatus(profileData?.availabilityStatus || "OFFLINE");
    } catch (error) {
      setMessage(error.message || "Failed to load volunteer profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

  const resetProfileImageSelection = () => {
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(null);
    setProfileImagePreviewUrl("");
  };

  const handleProfileImageSelection = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      resetProfileImageSelection();
      return;
    }

    const validationError = validateProfileImageFile(selectedFile);
    if (validationError) {
      resetProfileImageSelection();
      setMessage(validationError);
      return;
    }

    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(selectedFile);
    setProfileImagePreviewUrl(URL.createObjectURL(selectedFile));
    setMessage("");
  };

  const handleProfileImageUpload = async () => {
    if (!(profileImageFile instanceof File)) {
      setMessage("Select an image before uploading.");
      return;
    }

    setProfileImageSaving(true);
    setMessage("");

    try {
      await updateAccountProfileImage({ file: profileImageFile });
      await refreshSession();
      resetProfileImageSelection();
      setMessage("Profile image updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to update profile image");
    } finally {
      setProfileImageSaving(false);
    }
  };

  const handleProfileImageRemove = async () => {
    setProfileImageSaving(true);
    setMessage("");

    try {
      await updateAccountProfileImage({ remove: true });
      await refreshSession();
      resetProfileImageSelection();
      setMessage("Profile image removed successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to remove profile image");
    } finally {
      setProfileImageSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await apiClient.patch("/api/volunteer/profile-update", {
        skills: fromCsv(skills),
        serviceDistricts: fromCsv(districts),
      });

      const statusResp = await updateVolunteerAvailability(availabilityStatus);

      setMessage(`Profile updated. Availability: ${statusResp?.profile?.availabilityStatus || availabilityStatus}`);
      await loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const verificationLabel = useMemo(() => {
    if (!profile) return "Unknown";
    return profile.verifiedByAdmin ? "Admin Verified" : "Pending Admin Approval";
  }, [profile]);

  return (
    <DashboardLayout
      sidebarItems={volunteerSidebarItems}
      portalTitle="Volunteer Portal"
      avatarLetter="V"
      homePath="/volunteer-dashboard"
      searchPlaceholder="Search profile settings..."
    >
      <div className="space-y-6">
        <VolunteerSectionHeader
          title="Volunteer Profile"
          subtitle="Manage skills, service districts, and availability"
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">Loading profile...</div>
        ) : !profile ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
            Profile not found. Complete your volunteer profile setup first.
          </div>
        ) : (
          <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <ProfileAvatar
                  imageUrl={profileImagePreviewUrl || user?.profileImageUrl || ""}
                  fallbackText={user?.name?.trim()?.slice(0, 1) || "V"}
                  alt="Volunteer profile image"
                  wrapperClassName="h-16 w-16"
                  imageClassName="h-16 w-16 rounded-full object-cover border border-slate-300"
                  fallbackClassName="h-16 w-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg font-bold"
                  fallbackIconClassName="h-5 w-5 text-emerald-700"
                />

                <div className="flex-1 min-w-[220px] space-y-2">
                  <label className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer">
                    Choose Profile Image
                    <input
                      type="file"
                      accept={PROFILE_IMAGE_ACCEPT}
                      onChange={handleProfileImageSelection}
                      className="hidden"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleProfileImageUpload}
                      disabled={profileImageSaving || !(profileImageFile instanceof File)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {profileImageSaving ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileImageRemove}
                      disabled={profileImageSaving}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove Current
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">{PROFILE_IMAGE_HELP_TEXT}</p>
                  {profileImageFile ? (
                    <p className="text-xs text-slate-500">Selected: {profileImageFile.name}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs uppercase text-slate-500">Name</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{profile.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Email</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{profile.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Phone</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{profile.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Verification</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{verificationLabel}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Skills (comma separated)</label>
              <input
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="FIRST_AID, RESCUE, LOGISTICS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service Districts (comma separated)</label>
              <input
                value={districts}
                onChange={(event) => setDistricts(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Colombo, Gampaha"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(event) => setAvailabilityStatus(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            {message && <p className="text-sm text-slate-600">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerProfilePage;

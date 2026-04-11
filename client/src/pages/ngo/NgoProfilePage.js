import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getNgoProfile, updateNgoProfile, deleteNgoProfile, updateAccountProfileImage } from "../../services/profileService";
import { validateProfileImageFile, PROFILE_IMAGE_ACCEPT } from "../../utils/profileImageValidation";
import ProfileAvatar from "../../components/common/ProfileAvatar";
import {
  User, Mail, Phone, MapPin, Home, AlertTriangle, Edit2, Save, X,
  Shield, Calendar, Clock, CheckCircle, Trash2, ChevronRight, Loader2,
  Award, Globe, Lock, Star, Camera, Settings, LogOut, UserCircle, Hash, Building, FileText, ToggleLeft
} from "lucide-react";

const NgoProfilePage = () => {
  const { user, profile, logout, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const photoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    phone: "",
    address: {
      street: "",
      city: "",
      province: ""
    },
    description: "",
    availabilityStatus: "AVAILABLE"
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          province: profile.address?.province || ""
        },
        description: profile.description || "",
        availabilityStatus: profile.availabilityStatus || "AVAILABLE"
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await updateNgoProfile(formData);
      await refreshSession();
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          province: profile.address?.province || ""
        },
        description: profile.description || "",
        availabilityStatus: profile.availabilityStatus || "AVAILABLE"
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleDeleteAccount = async () => {
    setError("");
    setDeleting(true);

    try {
      await deleteNgoProfile();
      await logout();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleAvatarClick = () => {
    if (!photoUploading) photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfileImageFile(file);
    if (validationError) {
      setPhotoError(validationError);
      e.target.value = "";
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(previewUrl);
    setPhotoError("");
    setPhotoUploading(true);

    try {
      await updateAccountProfileImage({ file });
      await refreshSession();
      setSuccess("Profile photo updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Failed to upload photo.");
      setPhotoPreviewUrl("");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCircle className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-gray-600 mt-1">Manage your account and organization information</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Edit2 className="w-5 h-5" />
                <span className="font-semibold">Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-teal-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Profile Header with clickable avatar */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
                <div className="flex items-center space-x-4">
                  {/* Clickable Avatar */}
                  <div
                    className="relative w-20 h-20 cursor-pointer group"
                    onClick={handleAvatarClick}
                    title="Click to change photo"
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept={PROFILE_IMAGE_ACCEPT}
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {photoUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <ProfileAvatar
                          imageUrl={photoPreviewUrl || user?.profileImageUrl || ""}
                          fallbackText="N"
                          alt="NGO profile photo"
                          wrapperClassName="w-20 h-20"
                          imageClassName="w-20 h-20 object-cover"
                          fallbackClassName="w-20 h-20 flex items-center justify-center"
                          fallbackIconClassName="w-10 h-10 text-white"
                        />
                      )}
                    </div>
                    {/* Camera overlay on hover */}
                    {!photoUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-teal-100">NGO</p>
                    {photoError && (
                      <p className="text-red-300 text-xs mt-1">{photoError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Account Information */}
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-teal-600" />
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Award className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="font-medium text-gray-900 capitalize">NGO</p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Account Status</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-teal-600">
                            {user.isAccountVerified && profile.approvalStatus === 'approved' ? "Verified" : "Not Verified"}
                          </p>
                          {user.isAccountVerified && profile.approvalStatus === 'approved' && (
                            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-gray-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-semibold">Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Profile Details</h2>
                      <p className="text-teal-100">Manage your organization details</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Profile Form */}
              <div className="p-8">
                <div className="space-y-8">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-teal-600" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Enter phone number"
                        />
                        <div className="absolute right-3 top-3.5 text-gray-400">
                          <Phone className="w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-teal-600" />
                          </div>
                          <span className="text-gray-900 font-medium">
                            {profile.phone || "Not provided"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-teal-600" />
                      Address
                    </label>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleInputChange("address.street", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                            placeholder="Street address"
                          />
                          <div className="absolute right-3 top-3.5 text-gray-400">
                            <Home className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.address.city}
                              onChange={(e) => handleInputChange("address.city", e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                              placeholder="City / District"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <Globe className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.address.province}
                              onChange={(e) => handleInputChange("address.province", e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                              placeholder="Province"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {profile.address?.street || "No street address"}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {profile.address?.city || "No city"}, {profile.address?.province || "No province"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registration Number (Non-editable) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-teal-600" />
                      Registration Number
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Hash className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {profile.registrationNumber || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Organization Type (Non-editable) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-teal-600" />
                      Organization Type
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {profile.organizationType || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description / About */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-teal-600" />
                      About / Description
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                          placeholder="Describe your organization..."
                        />
                        <div className="absolute right-3 top-3.5 text-gray-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">
                              {profile.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <ToggleLeft className="w-4 h-4 mr-2 text-teal-600" />
                      Availability Status
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={formData.availabilityStatus}
                          onChange={(e) => handleInputChange("availabilityStatus", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 bg-white"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                        </select>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile.availabilityStatus === 'AVAILABLE' ? 'bg-teal-100' : 'bg-red-100'}`}>
                              <ToggleLeft className={`w-5 h-5 ${profile.availabilityStatus === 'AVAILABLE' ? 'text-teal-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <p className={`font-medium ${profile.availabilityStatus === 'AVAILABLE' ? 'text-teal-600' : 'text-red-600'}`}>
                                {profile.availabilityStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
               <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Are you sure you want to delete your organization account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoProfilePage;

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, Loader2, Power, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import ProfileAvatar from '../common/ProfileAvatar';
import { updateAccountProfileImage } from '../../services/profileService';
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_HELP_TEXT, validateProfileImageFile } from '../../utils/profileImageValidation';

const NGOprofilepop = ({ isOpen, onClose, ngoData, onToggleStatus }) => {
  const { user, refreshSession } = useAuth();
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState('');
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageMessage, setImageMessage] = useState('');

  const avatarFallbackLetter = useMemo(() => {
    const letter = typeof user?.name === 'string' ? user.name.trim().slice(0, 1) : '';
    return letter ? letter.toUpperCase() : 'N';
  }, [user?.name]);

  useEffect(() => {
    if (!isOpen && profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
      setProfileImagePreviewUrl('');
      setProfileImageFile(null);
      setImageError('');
      setImageMessage('');
    }
  }, [isOpen, profileImagePreviewUrl]);

  const resetSelection = () => {
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }
    setProfileImagePreviewUrl('');
    setProfileImageFile(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      resetSelection();
      return;
    }

    const validationError = validateProfileImageFile(selectedFile);
    if (validationError) {
      resetSelection();
      setImageError(validationError);
      setImageMessage('');
      return;
    }

    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(selectedFile);
    setProfileImagePreviewUrl(URL.createObjectURL(selectedFile));
    setImageError('');
    setImageMessage('');
  };

  const handleUpload = async () => {
    if (!(profileImageFile instanceof File)) {
      setImageError('Select an image before uploading.');
      return;
    }

    setImageSaving(true);
    setImageError('');
    setImageMessage('');

    try {
      const response = await updateAccountProfileImage({ file: profileImageFile });
      await refreshSession();
      resetSelection();
      setImageMessage(response?.message || 'Profile image updated successfully.');
    } catch (requestError) {
      setImageError(requestError.response?.data?.message || requestError.message || 'Failed to update profile image.');
    } finally {
      setImageSaving(false);
    }
  };

  const handleRemove = async () => {
    setImageSaving(true);
    setImageError('');
    setImageMessage('');

    try {
      const response = await updateAccountProfileImage({ remove: true });
      await refreshSession();
      resetSelection();
      setImageMessage(response?.message || 'Profile image removed successfully.');
    } catch (requestError) {
      setImageError(requestError.response?.data?.message || requestError.message || 'Failed to remove profile image.');
    } finally {
      setImageSaving(false);
    }
  };

  if (!isOpen || !ngoData) return null;

  return (
    <div className="absolute right-0 top-12 mt-2 w-72 bg-white rounded-xl shadow-ambient border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <ProfileAvatar
            imageUrl={profileImagePreviewUrl || user?.profileImageUrl || ''}
            fallbackText={avatarFallbackLetter}
            alt="NGO profile image"
            wrapperClassName="h-10 w-10"
            imageClassName="h-10 w-10 rounded-full object-cover border border-auth-border"
            fallbackClassName="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold"
            fallbackIconClassName="h-4 w-4 text-primary"
          />
          <div>
            <p className="font-semibold text-gray-900">NGO Profile</p>
            <p className="text-xs text-gray-500">ID: {ngoData.registrationNumber}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 text-sm">
        <div className="rounded-lg border border-gray-100 p-3 space-y-2">
          <label className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer">
            Choose Profile Image
            <input
              type="file"
              accept={PROFILE_IMAGE_ACCEPT}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={imageSaving || !(profileImageFile instanceof File)}
              className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {imageSaving ? <Loader2 size={14} className="mx-auto animate-spin" /> : 'Upload'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={imageSaving}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>

          <p className="text-[11px] text-gray-500">{PROFILE_IMAGE_HELP_TEXT}</p>
          {profileImageFile ? (
            <p className="text-[11px] text-gray-500">Selected: {profileImageFile.name}</p>
          ) : null}

          {imageError ? <p className="text-[11px] text-red-600">{imageError}</p> : null}
          {imageMessage ? <p className="text-[11px] text-green-600">{imageMessage}</p> : null}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Approval Status</span>
          {ngoData.approvalStatus === 'approved' ? (
            <span className="flex items-center text-tertiary font-medium">
              <CheckCircle size={14} className="mr-1" /> Approved
            </span>
          ) : (
            <span className="flex items-center text-yellow-500 font-medium">
              <Clock size={14} className="mr-1" /> Pending
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          <span className="text-gray-600">Availability</span>
          <button 
            onClick={onToggleStatus}
            className={`flex items-center px-3 py-1.5 rounded-md transition-colors text-xs font-bold ${
              ngoData.availabilityStatus === 'AVAILABLE' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            <Power size={14} className="mr-1" />
            {ngoData.availabilityStatus === 'AVAILABLE' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 text-center">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NGOprofilepop;

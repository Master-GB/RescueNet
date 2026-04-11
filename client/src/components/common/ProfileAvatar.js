import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import profilePlaceholder from "../../assets/images/profile-placeholder.svg";

const ProfileAvatar = ({
  imageUrl,
  fallbackText = "U",
  alt = "Profile image",
  wrapperClassName = "",
  imageClassName = "",
  fallbackClassName = "",
  fallbackIconClassName = "",
}) => {
  const [isPrimaryImageBroken, setIsPrimaryImageBroken] = useState(false);
  const [isPlaceholderBroken, setIsPlaceholderBroken] = useState(false);

  const normalizedImageUrl = useMemo(() => {
    if (typeof imageUrl !== "string") {
      return "";
    }

    return imageUrl.trim();
  }, [imageUrl]);

  useEffect(() => {
    setIsPrimaryImageBroken(false);
    setIsPlaceholderBroken(false);
  }, [normalizedImageUrl]);

  const hasPrimaryImage = Boolean(normalizedImageUrl) && !isPrimaryImageBroken;

  const resolvedImageUrl = useMemo(() => {
    if (hasPrimaryImage) {
      return normalizedImageUrl;
    }

    if (!isPlaceholderBroken) {
      return profilePlaceholder;
    }

    return "";
  }, [hasPrimaryImage, isPlaceholderBroken, normalizedImageUrl]);

  const handleImageError = useCallback(() => {
    if (hasPrimaryImage) {
      setIsPrimaryImageBroken(true);
      return;
    }

    setIsPlaceholderBroken(true);
  }, [hasPrimaryImage]);

  const normalizedFallbackText = useMemo(() => {
    if (typeof fallbackText !== "string") {
      return "U";
    }

    const trimmed = fallbackText.trim();
    return trimmed ? trimmed.slice(0, 1).toUpperCase() : "U";
  }, [fallbackText]);

  return (
    <div className={wrapperClassName}>
      {resolvedImageUrl ? (
        <img
          src={resolvedImageUrl}
          alt={alt}
          className={imageClassName}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={fallbackClassName}>
          {normalizedFallbackText ? (
            <span>{normalizedFallbackText}</span>
          ) : (
            <User className={fallbackIconClassName} />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(ProfileAvatar);

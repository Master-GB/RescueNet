export const ROLE = {
  ADMIN: "ADMIN",
  CITIZEN: "CITIZEN",
  VOLUNTEER: "VOLUNTEER",
  NGO: "NGO",
};

export const DASHBOARD_ROUTES = {
  [ROLE.ADMIN]: "/admin-dashboard",
  [ROLE.CITIZEN]: "/citizen-dashboard",
  [ROLE.VOLUNTEER]: "/volunteer-dashboard",
  [ROLE.NGO]: "/ngo-dashboard",
};

export const PROFILE_SETUP_ROUTES = {
  [ROLE.CITIZEN]: "/citizen/profile-setup",
  [ROLE.VOLUNTEER]: "/volunteer/profile-setup",
  [ROLE.NGO]: "/ngo/profile-setup",
};

export const PENDING_ROUTES = {
  [ROLE.VOLUNTEER]: "/volunteer/pending-approval",
  [ROLE.NGO]: "/ngo/pending-approval",
};

export const isFullyOnboarded = ({ user, profile } = {}) => {
  if (!user || !user.isAccountVerified) {
    return false;
  }

  if (user.role === ROLE.ADMIN) {
    return true;
  }

  if (!profile) {
    return false;
  }

  if (user.role === ROLE.VOLUNTEER) {
    return Boolean(profile.verifiedByAdmin);
  }

  if (user.role === ROLE.NGO) {
    return profile.approvalStatus === "approved";
  }

  return true;
};

export const resolvePostAuthRoute = ({ user, profile } = {}) => {
  if (!user) {
    return "/auth/login";
  }

  if (!user.isAccountVerified) {
    return "/auth/verify-account";
  }

  if (user.role === ROLE.ADMIN) {
    return DASHBOARD_ROUTES[ROLE.ADMIN];
  }

  if (!profile) {
    return PROFILE_SETUP_ROUTES[user.role] || "/auth/login";
  }

  if (user.role === ROLE.VOLUNTEER && !profile.verifiedByAdmin) {
    return PENDING_ROUTES[ROLE.VOLUNTEER];
  }

  if (user.role === ROLE.NGO && profile.approvalStatus !== "approved") {
    return PENDING_ROUTES[ROLE.NGO];
  }

  return DASHBOARD_ROUTES[user.role] || "/auth/login";
};

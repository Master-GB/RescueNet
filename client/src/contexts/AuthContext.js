import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { subscribeUnauthorized } from "../services/apiClient";
import {
  fetchMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";
import { resolvePostAuthRoute as resolveAuthRoute } from "../services/authRouting";

export const AuthContext = createContext(null);

const syncLegacyUserName = (sessionUser) => {
  if (sessionUser?.name) {
    localStorage.setItem("userDisplayName", sessionUser.name);
    localStorage.setItem("userName", sessionUser.name);
    return;
  }

  localStorage.removeItem("userDisplayName");
  localStorage.removeItem("userName");
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setProfile(null);
    syncLegacyUserName(null);
  }, []);

  const setAuthSession = useCallback((sessionData) => {
    const nextUser = sessionData?.user || null;
    const nextProfile = sessionData?.profile ?? null;

    setUser(nextUser);
    setProfile(nextProfile);
    syncLegacyUserName(nextUser);

    return { user: nextUser, profile: nextProfile };
  }, []);

  const refreshSession = useCallback(async () => {
    const sessionData = await fetchMe();
    return setAuthSession(sessionData);
  }, [setAuthSession]);

  const registerAccount = useCallback(
    async (payload) => {
      const data = await registerUser(payload);
      await refreshSession();
      return data;
    },
    [refreshSession],
  );

  const loginAccount = useCallback(
    async (payload) => {
      const loginData = await loginUser(payload);
      const session = await refreshSession();
      return { loginData, session };
    },
    [refreshSession],
  );

  const logout = useCallback(
    async ({ redirectTo = "/auth/login" } = {}) => {
      try {
        await logoutUser();
      } catch {
        // Local state cleanup should still happen even if API logout fails.
      }

      clearSession();
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    },
    [clearSession, navigate],
  );

  const handleUnauthorized = useCallback(() => {
    clearSession();

    const publicPaths = ["/", "/about", "/contact"];
    const isPublicPath = publicPaths.includes(location.pathname) || location.pathname.startsWith("/auth");

    if (!isPublicPath) {
      navigate("/auth/login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [clearSession, location.pathname, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeUnauthorized(handleUnauthorized);
    return unsubscribe;
  }, [handleUnauthorized]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const sessionData = await fetchMe();
        if (isMounted) {
          setAuthSession(sessionData);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, setAuthSession]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isInitializing,
      isAuthenticated: Boolean(user),
      clearSession,
      setAuthSession,
      refreshSession,
      registerAccount,
      loginAccount,
      logout,
      resolvePostAuthRoute: (sessionData) =>
        resolveAuthRoute(sessionData || { user, profile }),
    }),
    [
      user,
      profile,
      isInitializing,
      clearSession,
      setAuthSession,
      refreshSession,
      registerAccount,
      loginAccount,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

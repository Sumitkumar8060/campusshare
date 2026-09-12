import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "@/api/auth";
import { getProfile } from "@/api/users";

export const AuthContext = createContext(null);

const TOKEN_KEY = "campusshare_token";
const USER_KEY = "campusshare_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = useState(!!localStorage.getItem(TOKEN_KEY));

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  }, []);

  // On mount, if a token exists, validate it and hydrate the full profile
  // (login response doesn't include phone/profileImage, so we fetch them here).
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const profile = await getProfile();
        if (!cancelled) persistUser(profile);
      } catch {
        if (!cancelled) {
          setToken(null);
          persistUser(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await apiLogin(credentials);
      const { token: newToken, ...basicUser } = data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      // Fetch the full profile so phone/profileImage are available immediately.
      try {
        const fullProfile = await getProfile();
        persistUser(fullProfile);
      } catch {
        persistUser(basicUser);
      }
      return data;
    },
    [persistUser]
  );

  const register = useCallback(async (payload) => {
    return apiRegister(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    persistUser(null);
  }, [persistUser]);

  const updateLocalUser = useCallback(
    (patch) => {
      persistUser({ ...user, ...patch });
    },
    [persistUser, user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      initializing,
      login,
      register,
      logout,
      updateLocalUser,
    }),
    [user, token, initializing, login, register, logout, updateLocalUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

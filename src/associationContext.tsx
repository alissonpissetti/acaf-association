import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  setToken,
  type AssociationAdminUser,
} from './api/auth';

type AssociationContextValue = {
  user: AssociationAdminUser | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  hasPermission: (key: string) => boolean;
};

const AssociationContext = createContext<AssociationContextValue | null>(null);

export function AssociationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AssociationAdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const applyProfile = useCallback((profile: AssociationAdminUser) => {
    setUser(profile);
    setPermissions(Array.isArray(profile.permissions) ? profile.permissions : []);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setPermissions([]);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      logout();
      return;
    }
    const profile = await getMe(token);
    applyProfile(profile);
  }, [applyProfile, logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe(token)
      .then(applyProfile)
      .catch(() => {
        clearToken();
        setUser(null);
        setPermissions([]);
      })
      .finally(() => setLoading(false));
  }, [applyProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email.trim(), password);
      setToken(result.accessToken);
      applyProfile(result.user as AssociationAdminUser);
    },
    [applyProfile],
  );

  const hasPermission = useCallback((key: string) => permissions.includes(key), [permissions]);

  const value = useMemo(
    () => ({
      user,
      permissions,
      loading,
      login,
      logout,
      refreshProfile,
      hasPermission,
    }),
    [user, permissions, loading, login, logout, refreshProfile, hasPermission],
  );

  return <AssociationContext.Provider value={value}>{children}</AssociationContext.Provider>;
}

export function useAssociation() {
  const ctx = useContext(AssociationContext);
  if (!ctx) throw new Error('useAssociation must be used within AssociationProvider');
  return ctx;
}

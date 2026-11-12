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
  loginWithOtp as apiLoginWithOtp,
  requestOtp as apiRequestOtp,
  resetPasswordWithOtp as apiResetPasswordWithOtp,
  setToken,
  type AssociationAdminUser,
  type OtpPurpose,
} from './api/auth';

type AssociationContextValue = {
  user: AssociationAdminUser | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (mobilePhone: string, code: string) => Promise<void>;
  requestOtp: (mobilePhone: string, purpose: OtpPurpose) => Promise<{ ok: boolean; message?: string }>;
  resetPasswordWithOtp: (
    mobilePhone: string,
    code: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; message?: string }>;
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

  const loginWithOtp = useCallback(
    async (mobilePhone: string, code: string) => {
      const result = await apiLoginWithOtp(mobilePhone, code);
      setToken(result.accessToken);
      applyProfile(result.user as AssociationAdminUser);
    },
    [applyProfile],
  );

  const requestOtp = useCallback(
    (mobilePhone: string, purpose: OtpPurpose) => apiRequestOtp(mobilePhone, purpose),
    [],
  );

  const resetPasswordWithOtp = useCallback(
    (mobilePhone: string, code: string, newPassword: string) =>
      apiResetPasswordWithOtp(mobilePhone, code, newPassword),
    [],
  );

  const hasPermission = useCallback((key: string) => permissions.includes(key), [permissions]);

  const value = useMemo(
    () => ({
      user,
      permissions,
      loading,
      login,
      loginWithOtp,
      requestOtp,
      resetPasswordWithOtp,
      logout,
      refreshProfile,
      hasPermission,
    }),
    [
      user,
      permissions,
      loading,
      login,
      loginWithOtp,
      requestOtp,
      resetPasswordWithOtp,
      logout,
      refreshProfile,
      hasPermission,
    ],
  );

  return <AssociationContext.Provider value={value}>{children}</AssociationContext.Provider>;
}

export function useAssociation() {
  const ctx = useContext(AssociationContext);
  if (!ctx) throw new Error('useAssociation must be used within AssociationProvider');
  return ctx;
}

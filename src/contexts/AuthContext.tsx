import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Language } from '../types';
import { isSupabaseConfigured, supabase, LOCAL_STORAGE_KEYS } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode?: boolean;
  login: (phoneOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (profileData: Partial<UserProfile>, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved local session or Supabase session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile from supabase 'profiles' table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                name: profile.name || 'Farmer',
                phone: profile.phone || '',
                email: session.user.email,
                role: profile.role || 'farmer',
                language: (profile.language as Language) || 'mr',
                district: profile.district || 'Yavatmal',
                village: profile.village || '',
                farmSizeAcres: profile.farm_size_acres || 5,
                activeCrops: profile.active_crops || ['कापूस (Cotton)'],
                avatarUrl: profile.avatar_url,
                isDemoUser: false,
              });
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local storage session
        const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            setUser({ ...parsed, isDemoUser: false });
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);



  const login = async (phoneOrEmail: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      if (phoneOrEmail.includes('@') && password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: phoneOrEmail,
          password,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    }

    // Direct phone or email login
    const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed.phone === phoneOrEmail || parsed.email === phoneOrEmail) {
          const authenticated = { ...parsed, isDemoUser: false };
          setUser(authenticated);
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(authenticated));
          return { success: true };
        }
      } catch {}
    }

    // Standard profile on phone login
    const profile: UserProfile = {
      id: 'farmer-' + Date.now(),
      name: phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : `शेतकरी (${phoneOrEmail})`,
      phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : undefined,
      role: 'farmer',
      language: 'mr',
      district: 'यवतमाळ (Yavatmal)',
      village: 'दारव्हा (Darwha)',
      farmSizeAcres: 5.0,
      activeCrops: ['कापूस (Cotton)', 'सोयाबीन (Soybean)', 'तूर (Pigeonpea)'],
      isDemoUser: false,
    };
    setUser(profile);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(profile));
    return { success: true };
  };

  const signup = async (profileData: Partial<UserProfile>, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase && profileData.email && password) {
      const { data, error } = await supabase.auth.signUp({
        email: profileData.email,
        password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: profileData.name,
          phone: profileData.phone,
          district: profileData.district,
          village: profileData.village,
          farm_size_acres: profileData.farmSizeAcres,
          active_crops: profileData.activeCrops,
          role: profileData.role || 'farmer',
          language: profileData.language || 'mr',
        });
      }
      return { success: true };
    }

    // New registered profile
    const newProfile: UserProfile = {
      id: 'farmer-' + Date.now(),
      name: profileData.name || 'नवीन शेतकरी',
      phone: profileData.phone || '',
      email: profileData.email,
      role: profileData.role || 'farmer',
      language: profileData.language || 'mr',
      district: profileData.district || 'यवतमाळ (Yavatmal)',
      village: profileData.village || '',
      farmSizeAcres: profileData.farmSizeAcres || 5,
      activeCrops: profileData.activeCrops || ['कापूस (Cotton)', 'सोयाबीन (Soybean)'],
      isDemoUser: false,
    };
    setUser(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newProfile));
    return { success: true };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, isDemoUser: false };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          name: updated.name,
          phone: updated.phone,
          district: updated.district,
          village: updated.village,
          farm_size_acres: updated.farmSizeAcres,
          active_crops: updated.activeCrops,
          language: updated.language,
        })
        .eq('id', user.id);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole, isDemoUser: false };
      setUser(updated);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode: false,
        login,
        signup,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

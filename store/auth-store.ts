import { create } from 'zustand';
import { User } from '../types/auth';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  token: string | null;
  activeCompanyId: string | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  setActiveCompany: (id: string) => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  activeCompanyId: null,
  isAuthenticated: false,
  hasSeenOnboarding: false,

  setAuth: async (user: User, token: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    const activeId = user.companies?.length > 0 ? user.companies[0] : null;
    if (activeId) await SecureStore.setItemAsync('active_company_id', activeId);
    set({ user, token, activeCompanyId: activeId, isAuthenticated: true });
  },

  setActiveCompany: async (id: string) => {
    await SecureStore.setItemAsync('active_company_id', id);
    set({ activeCompanyId: id });
  },

  setHasSeenOnboarding: async (value: boolean) => {
    await SecureStore.setItemAsync('has_seen_onboarding', value.toString());
    set({ hasSeenOnboarding: value });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('active_company_id');
    set({ user: null, token: null, activeCompanyId: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      const activeCompanyId = await SecureStore.getItemAsync('active_company_id');
      const hasSeenOnboarding = await SecureStore.getItemAsync('has_seen_onboarding');
      
      const updates: Partial<AuthState> = {};
      if (token && userData) {
        updates.user = JSON.parse(userData);
        updates.token = token;
        updates.activeCompanyId = activeCompanyId;
        updates.isAuthenticated = true;
      }
      if (hasSeenOnboarding === 'true') {
        updates.hasSeenOnboarding = true;
      }
      set(updates);
    } catch (error) {
      console.error('Failed to initialize auth store', error);
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    }
  },
}));

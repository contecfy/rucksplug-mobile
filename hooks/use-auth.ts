import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuthStore } from '../store/auth-store';
import { AuthResponse, LoginParams } from '../types/auth';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (params: LoginParams) => {
      const { data } = await apiClient.post<AuthResponse>('/users/login', params);
      return data;
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.post<AuthResponse>('/users', userData);
      return data;
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
    },
  });
};

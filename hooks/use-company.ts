import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export const usePublicCompanies = () => {
  return useQuery({
    queryKey: ['public-companies'],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>('/companies/public/list');
      return data;
    },
  });
};

export const useCompany = (id: string | null) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<any>(`/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

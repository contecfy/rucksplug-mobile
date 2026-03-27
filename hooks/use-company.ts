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

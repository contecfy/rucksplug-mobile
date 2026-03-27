import apiClient from './client';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'client' | 'admin' | 'investor' | 'loan_officer' | 'manager' | 'accountant' | 'collector' | 'compliance' | 'super_admin';
  username: string;
  nationalId: string;
  walletBalance: number;
}

export const userApi = {
  getUsers: async (): Promise<IUser[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getUserById: async (id: string): Promise<IUser> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  searchByNationalId: async (nationalId: string): Promise<IUser | null> => {
    try {
      const response = await apiClient.get(`/users/search/${nationalId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  linkToCompany: async (userId: string): Promise<IUser> => {
    const response = await apiClient.post(`/users/${userId}/link`);
    return response.data;
  },
};

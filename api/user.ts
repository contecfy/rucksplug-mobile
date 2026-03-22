import apiClient from './client';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'client' | 'admin' | 'investor';
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
};

import apiClient from './client';

export interface ILoan {
  _id: string;
  client: string | { _id: string; fullName: string };
  amount: number;
  interestRate: number;
  interestAmount: number;
  totalPayable: number;
  durationDays: number;
  startDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'defaulted';
  riskStatus: 'green' | 'yellow' | 'red';
  repaymentFrequency: 'daily' | 'weekly' | 'biweekly';
  totalRepaid: number;
  remainingBalance: number;
  purpose?: string;
  createdAt: string;
}

export const loanApi = {
  getLoans: async (): Promise<ILoan[]> => {
    const response = await apiClient.get('/loans');
    return response.data;
  },

  getLoanById: async (id: string): Promise<ILoan> => {
    const response = await apiClient.get(`/loans/${id}`);
    return response.data;
  },

  createLoan: async (data: Partial<ILoan>): Promise<ILoan> => {
    const response = await apiClient.post('/loans', data);
    return response.data;
  },

  approveLoan: async (id: string): Promise<ILoan> => {
    const response = await apiClient.patch(`/loans/${id}/approve`);
    return response.data;
  },

  applyPenalty: async (id: string): Promise<ILoan> => {
    const response = await apiClient.post(`/loans/${id}/penalty`);
    return response.data;
  },
  updateLoan: async (id: string, data: Partial<ILoan>): Promise<ILoan> => {
    const response = await apiClient.patch(`/loans/${id}`, data);
    return response.data;
  },
};

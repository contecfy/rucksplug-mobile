import apiClient from './client';

export interface IFinancialSummary {
    totalLent: number;
    totalRepaid: number;
    totalProfit: number;
    activePortfolio: number;
    activePrincipal: number;
    collectionRate: number;
    ongoingCount: number;
    defaultedCount: number;
    completedCount: number;
    totalCount: number;
    timestamp: string;
}

export const reportApi = {
    getFinancialSummary: async (): Promise<IFinancialSummary> => {
        const response = await apiClient.get('/reports/generate/financial');
        return response.data;
    },
};

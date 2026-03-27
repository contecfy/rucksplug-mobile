import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// For Android emulator, use 10.0.2.2 instead of localhost
const baseURL = 'https://rucksplug-backend.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token and active company ID to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  const activeCompanyId = await SecureStore.getItemAsync('active_company_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^["']|["']$/g, "").trim()}`;
  }

  if (activeCompanyId) {
    config.headers['x-company-id'] = activeCompanyId;
  }

  return config;
});

export default apiClient;

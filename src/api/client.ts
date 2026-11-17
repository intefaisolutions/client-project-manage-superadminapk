import { API_BASE_URL } from '../constants/config';
import { ApiError } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await AsyncStorage.getItem('@auth/access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
        `Request failed with status ${response.status}`;
      const code = data?.code || data?.error;
      throw new ApiError(response.status, message, code);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network / connection error
    throw new ApiError(
      0,
      'Unable to connect to server. Please check your internet connection or backend status.',
      'NETWORK_ERROR'
    );
  }
}

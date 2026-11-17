import { request } from './client';
import {
  AuthResponse,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  UserProfile,
} from './types';

export const authService = {
  requestOtp: async (payload: OtpRequestPayload): Promise<OtpRequestResponse> => {
    return request<OtpRequestResponse>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyOtp: async (payload: OtpVerifyPayload): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<UserProfile> => {
    return request<UserProfile>('/auth/me', {
      method: 'GET',
    });
  },

  logout: async (): Promise<{ loggedOut: boolean }> => {
    try {
      return await request<{ loggedOut: boolean }>('/auth/logout', {
        method: 'POST',
      });
    } catch {
      return { loggedOut: true };
    }
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionData, UserProfile } from '../api/types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
  USER_PROFILE: '@auth/user_profile',
  PHONE: '@auth/phone',
};

export const saveSession = async (session: SessionData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(session.user));
    await AsyncStorage.setItem(STORAGE_KEYS.PHONE, session.phone);
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

export const getSession = async (): Promise<SessionData | null> => {
  try {
    const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const phone = await AsyncStorage.getItem(STORAGE_KEYS.PHONE);

    if (!accessToken || !userJson) {
      return null;
    }

    const user: UserProfile = JSON.parse(userJson);
    return {
      accessToken,
      refreshToken: refreshToken || '',
      user,
      phone: phone || '',
    };
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    await AsyncStorage.removeItem(STORAGE_KEYS.PHONE);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

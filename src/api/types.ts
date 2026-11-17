export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  expiresInMinutes?: number;
}

export interface OtpVerifyPayload {
  phone: string;
  code: string;
}

export interface UserDataScope {
  isAgencyWide?: boolean;
  assignedClients?: string[];
  departmentId?: string;
  department?: string;
}

export interface UserProfile {
  _id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roleName?: string;
  permissions?: string[];
  dataScope?: UserDataScope;
  department?: string;
  designation?: string;
  avatarUrl?: string;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  phone: string;
}

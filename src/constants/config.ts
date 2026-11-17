import appJson from '../../app.json';

export interface ApkConfig {
  apkId: 'super-admin' | 'agency' | 'client';
  apkName: string;
  dashboardTitle: string;
  tagline: string;
  allowedRoles?: string[];
  disallowedRoles?: string[];
}

// ============================================================================
// Backend API Configuration
// ============================================================================
// Android Emulator host loopback: 'http://10.0.2.2:3032/api'
// Physical Android Device on WiFi LAN: 'http://192.168.1.14:3032/api'
// Production Server: 'https://cpm.intefai.com/api'
export const API_BASE_URL = 'http://10.0.2.2:3032/api';

export const getApkConfig = (): ApkConfig => {
  const name = ((appJson as any)?.name || '').toLowerCase();
  if (name.includes('superadmin')) {
    return {
      apkId: 'super-admin',
      apkName: 'Super Admin Portal',
      dashboardTitle: 'Super Admin Dashboard',
      tagline: 'Agency Operations & Control',
      allowedRoles: ['SUPER_ADMIN', 'BUSINESS_HEAD'],
      disallowedRoles: ['CLIENT'],
    };
  }
  if (name.includes('client')) {
    return {
      apkId: 'client',
      apkName: 'Client Portal',
      dashboardTitle: 'Client Dashboard',
      tagline: 'Projects & Approvals Portal',
      allowedRoles: ['CLIENT'],
      disallowedRoles: [
        'SUPER_ADMIN',
        'BUSINESS_HEAD',
        'DIGITAL_MARKETING_MANAGER',
        'SALES_BUSINESS_DEVELOPMENT',
        'CONTENT_CREATOR_VIDEOGRAPHER',
        'GRAPHIC_DESIGNER',
        'VIDEO_EDITOR',
        'PERFORMANCE_MARKETER',
        'SEO_LOCAL_SEO_SPECIALIST',
        'MANAGER',
        'TEAM_LEAD',
        'EMPLOYEE',
      ],
    };
  }
  return {
    apkId: 'agency',
    apkName: 'Agency Portal',
    dashboardTitle: 'Agency Dashboard',
    tagline: 'Digital Marketing Execution',
    allowedRoles: [
      'SUPER_ADMIN',
      'BUSINESS_HEAD',
      'DIGITAL_MARKETING_MANAGER',
      'SALES_BUSINESS_DEVELOPMENT',
      'CONTENT_CREATOR_VIDEOGRAPHER',
      'GRAPHIC_DESIGNER',
      'VIDEO_EDITOR',
      'PERFORMANCE_MARKETER',
      'SEO_LOCAL_SEO_SPECIALIST',
      'MANAGER',
      'TEAM_LEAD',
      'EMPLOYEE',
    ],
    disallowedRoles: ['CLIENT'],
  };
};

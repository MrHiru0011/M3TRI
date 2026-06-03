export interface Config {
  endpoints: Endpoints;
  oauth: OAuthConfig;
  session: SessionConfig;
}

export interface Endpoints {
  selfcarecms: string;
  captiveportal: string;
  myim3asset: string;
  bimatri: string;
  myim3api1: string;
  myim3: string;
  myim3app: string;
  im3id: string;
  myim3temp: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  token: string;
  grantType: string;
}

export interface SessionConfig {
  tokenFile: string;
  refreshInterval: number;
}

export interface UserProfile {
  msisdn: string;
  name: string;
  balance: string;
  activeUntil: string;
  status: string;
}

export interface Package {
  id: string | number;
  name: string;
  description: string;
  quota: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  category: string;
  pvrCode?: string;
  badge?: string;
}

export interface QuotaInfo {
  total: string;
  used: string;
  remaining: string;
  percentage: number;
  expiryDate: string;
}

export interface TransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  code: string;
  message: string;
  data: T;
}

export interface LoginCredentials {
  msisdn: string;
  otp?: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  msisdn: string;
  isLoggedIn: boolean;
}

export type PackageCategory =
  | 'all'
  | 'limited'
  | 'mini'
  | 'hemat'
  | 'pastimurah'
  | 'bimaplus'
  | 'antispam'
  | 'popular'
  | 'happy'
  | 'new'
  | 'belilagi'
  | 'terhemat'
  | 'hot'
  | 'addon';

export interface CategoryMap {
  [key: string]: string;
}

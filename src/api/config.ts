import { Config } from '../types';

export const config: Config = {
  endpoints: {
    selfcarecms: 'https://selfcarecms.ioh.co.id',
    captiveportal: 'https://captiveportal.gammasprint.com',
    myim3asset: 'https://myim3asset.ioh.co.id',
    bimatri: 'https://bimatri.ioh.co.id',
    myim3api1: 'https://myim3api1.ioh.co.id',
    myim3: 'https://myim3.ioh.co.id',
    myim3app: 'https://myim3app.indosatooredoo.com',
    im3id: 'https://im3.id',
    myim3temp: 'https://myim3temp.gammasprint.com',
  },
  oauth: {
    clientId: 'myim3-web',
    clientSecret: process.env.IM3_CLIENT_SECRET || '',
    token: '4925D15D7DE4ABE661412395692292F869BCD8B2B2F8312D6B4881187EB4513B735DD044A4B40F405E6F8A37A4E83B221FFF0E7A7347D3E460D449C2EAA78E42',
    grantType: 'client_credentials',
  },
  session: {
    tokenFile: '.im3_session.json',
    refreshInterval: 3600,
  },
};

export const CATEGORY_MAP: Record<string, string> = {
  'all': 'Semua Paket',
  'limited': 'Paket Limited',
  'mini': 'Paket Mini',
  'hemat': 'Paket Hemat',
  'pastimurah': 'PASTI MURAH',
  'bimaplus': 'Hanya di bima+',
  'antispam': 'Anti Spam/Scam',
  'popular': 'Paket Popular',
  'happy': 'Happy Package',
  'new': 'Paket Terbaru',
  'belilagi': 'Beli Lagi',
  'terhemat': 'Terhemat',
  'hot': 'Hot Sale',
  'addon': 'Add-on',
};

export const API_PATHS = {
  oauth: '/oauth/token',
  profile: '/api/v1/profile',
  packages: '/api/v1/packages',
  packageDetail: '/api/v1/packages/detail',
  purchase: '/api/v1/purchase',
  quota: '/api/v1/quota',
  balance: '/api/v1/balance',
  history: '/api/v1/transaction-history',
  otpRequest: '/api/v1/otp/request',
  otpVerify: '/api/v1/otp/verify',
};

export default config;

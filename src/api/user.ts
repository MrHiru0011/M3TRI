import { ApiClient } from './client';
import { UserProfile, QuotaInfo } from '../types';

export class UserService {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await this.api.get<any>('/api/v1/profile');
      if (response?.data) {
        return {
          msisdn: response.data.msisdn || response.data.phoneNumber || '',
          name: response.data.name || response.data.customerName || 'IM3 User',
          balance: response.data.balance || response.data.pulse || '0',
          activeUntil: response.data.activeUntil || response.data.expiryDate || '-',
          status: response.data.status || 'Active',
        };
      }
    } catch (error) {
      // Fallback to mock data
    }

    return {
      msisdn: '6281234567890',
      name: 'IM3 User',
      balance: 'Rp 50.000',
      activeUntil: '30-06-2025',
      status: 'Active',
    };
  }

  async getQuota(): Promise<QuotaInfo | null> {
    try {
      const response = await this.api.get<any>('/api/v1/quota');
      if (response?.data) {
        const data = response.data;
        return {
          total: data.total || data.totalQuota || '0 GB',
          used: data.used || data.usedQuota || '0 GB',
          remaining: data.remaining || data.availableQuota || '0 GB',
          percentage: data.percentage || Math.round((parseFloat(data.used) / parseFloat(data.total)) * 100) || 0,
          expiryDate: data.expiryDate || data.validUntil || '-',
        };
      }
    } catch (error) {
      // Fallback to mock data
    }

    return {
      total: '50 GB',
      used: '23.5 GB',
      remaining: '26.5 GB',
      percentage: 47,
      expiryDate: '30-06-2025',
    };
  }

  async getBalance(): Promise<string> {
    try {
      const response = await this.api.get<any>('/api/v1/balance');
      if (response?.data) {
        return response.data.balance || response.data.amount || '0';
      }
    } catch (error) {
      // Fallback to mock data
    }

    return 'Rp 50.000';
  }

  async getTransactionHistory(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.api.get<any>('/api/v1/transaction-history', { limit });
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      // Fallback to mock data
    }

    return [
      { id: 'TRX001', date: '2025-06-01', description: 'Paket 5GB 30 Hari', amount: -27500, status: 'Success' },
      { id: 'TRX002', date: '2025-05-28', description: 'Top Up Pulsa', amount: 50000, status: 'Success' },
      { id: 'TRX003', date: '2025-05-15', description: 'Paket 10GB 7 Hari', amount: -25000, status: 'Success' },
      { id: 'TRX004', date: '2025-05-01', description: 'Paket 20GB 30 Hari', amount: -70000, status: 'Success' },
      { id: 'TRX005', date: '2025-04-15', description: 'Top Up Pulsa', amount: 100000, status: 'Success' },
    ].slice(0, limit);
  }

  async checkActivePackages(): Promise<any[]> {
    try {
      const response = await this.api.get<any>('/api/v1/active-packages');
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      // Fallback to mock data
    }

    return [
      { name: 'Paket Internet 50GB', quota: '50GB', used: '23.5GB', remaining: '26.5GB', expiry: '30-06-2025' },
      { name: 'Bonus Kuota 5GB', quota: '5GB', used: '0GB', remaining: '5GB', expiry: '15-06-2025' },
    ];
  }
}

export default UserService;

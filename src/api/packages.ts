import { ApiClient } from './client';
import { config, CATEGORY_MAP } from './config';
import { Package, PackageCategory } from '../types';
import chalk from 'chalk';

const MOCK_PACKAGES: Package[] = [
  // PASTI MURAH
  { id: 1, name: '260GB 28 Hari', description: '260GB 28 Hari #SCQW184A', quota: '260GB', duration: '28 Hari', price: 260000, originalPrice: 325000, discount: '-20%', category: 'pastimurah', pvrCode: 'SCQW184A', badge: 'PASTI MURAH' },
  { id: 2, name: '11GB 30 Hari', description: '11GB 30 Hari #SCQW182A', quota: '11GB', duration: '30 Hari', price: 50000, originalPrice: 65000, discount: '-23%', category: 'pastimurah', pvrCode: 'SCQW182A', badge: 'PASTI MURAH' },
  { id: 3, name: '20GB 30 Hari', description: '(Beli Lagi) 20GB 30 Hari', quota: '20GB', duration: '30 Hari', price: 70000, originalPrice: 87500, discount: '-20%', category: 'pastimurah', pvrCode: '1027548', badge: 'PASTI MURAH' },
  { id: 4, name: '45GB 30 Hari', description: '45GB 30 Hari', quota: '45GB', duration: '30 Hari', price: 105000, category: 'pastimurah', pvrCode: '1080547' },
  { id: 5, name: '47GB 28 Hari', description: '47GB 28 Hari', quota: '47GB', duration: '28 Hari', price: 100000, category: 'pastimurah', pvrCode: '1080550' },
  { id: 6, name: '4GB 2 Hari', description: '(Terbaru) 4GB 2 Hari', quota: '4GB', duration: '2 Hari', price: 10000, originalPrice: 12500, discount: '-20%', category: 'pastimurah', pvrCode: '1038550' },
  { id: 7, name: '42GB 28 Hari', description: '42GB 28 Hari', quota: '42GB', duration: '28 Hari', price: 90000, category: 'pastimurah', pvrCode: '1100549' },

  // Hanya di bima+
  { id: 8, name: '17GB 7 Hari', description: '17GB 7 Hari', quota: '17GB', duration: '7 Hari', price: 30000, category: 'bimaplus', pvrCode: '2126589' },
  { id: 9, name: '10GB 7 Hari', description: '10GB 7 Hari', quota: '10GB', duration: '7 Hari', price: 25000, category: 'bimaplus', pvrCode: '2044577' },
  { id: 10, name: '7GB 5 Hari', description: '7GB 5 Hari', quota: '7GB', duration: '5 Hari', price: 20000, category: 'bimaplus', pvrCode: '2127586' },
  { id: 11, name: '2.5GB 2 Hari', description: '2.5GB 2 Hari', quota: '2.5GB', duration: '2 Hari', price: 10000, category: 'bimaplus', pvrCode: '29448' },
  { id: 12, name: '6GB + Nelpon SMS 3 Hari', description: '6GB + Nelpon SMS 3 Hari', quota: '6GB', duration: '3 Hari', price: 15000, category: 'bimaplus', pvrCode: '1922570' },
  { id: 13, name: '2.5GB 1 Hari', description: '2.5GB 1 Hari', quota: '2.5GB', duration: '1 Hari', price: 5000, category: 'bimaplus', pvrCode: '1930570' },
  { id: 14, name: '2.5GB 12 Jam', description: '2.5GB 12 Jam', quota: '2.5GB', duration: '12 Jam', price: 6000, category: 'bimaplus', pvrCode: '1917565' },
  { id: 15, name: '1GB 3 Jam', description: '1GB 3 Jam', quota: '1GB', duration: '3 Jam', price: 3500, category: 'bimaplus', pvrCode: '1918566' },

  // Anti Spam/Scam
  { id: 16, name: '16GB 28 Hari', description: '16GB 28 Hari', quota: '16GB', duration: '28 Hari', price: 50000, category: 'antispam', pvrCode: '1100815' },
  { id: 17, name: '100GB 28 Hari', description: '100GB 28 Hari', quota: '100GB', duration: '28 Hari', price: 125000, category: 'antispam', pvrCode: '1092319' },
  { id: 18, name: 'Happy 10GB 1 Hari', description: 'Happy 10GB 1 Hari', quota: '10GB', duration: '1 Hari', price: 10000, category: 'antispam', pvrCode: '2153581' },
  { id: 19, name: 'Happy 7GB 2 Hari', description: 'Happy 7GB 2 Hari', quota: '7GB', duration: '2 Hari', price: 12000, category: 'antispam', pvrCode: '2153580' },
  { id: 20, name: 'Happy 8GB 3 Hari', description: 'Happy 8GB 3 Hari', quota: '8GB', duration: '3 Hari', price: 16000, category: 'antispam', pvrCode: '2153579' },
  { id: 21, name: 'Happy 20GB 5 Hari', description: 'Happy 20GB 5 Hari', quota: '20GB', duration: '5 Hari', price: 25000, category: 'antispam', pvrCode: '2152579' },
  { id: 22, name: 'Happy 7GB 28 Hari', description: 'Happy 7GB 28 Hari', quota: '7GB', duration: '28 Hari', price: 35000, category: 'antispam', pvrCode: '2147577' },
  { id: 23, name: 'Happy 11GB 28 Hari', description: 'Happy 11GB 28 Hari', quota: '11GB', duration: '28 Hari', price: 45000, category: 'antispam', pvrCode: '2146578' },

  // POP
  { id: 24, name: 'TikTok 2GB 3 Hari', description: '(POP) TikTok 2GB 3 Hari', quota: '2GB', duration: '3 Hari', price: 0, originalPrice: 1000, discount: '-100%', category: 'limited', badge: 'POP' },
  { id: 25, name: 'YT 2GB 3 Hari', description: '(POP) YT 2GB 3 Hari', quota: '2GB', duration: '3 Hari', price: 0, originalPrice: 1000, discount: '-100%', category: 'limited', badge: 'POP' },
  { id: 26, name: 'WA 2GB 3 Hari', description: '(POP) WA 2GB 3 Hari', quota: '2GB', duration: '3 Hari', price: 0, category: 'limited', badge: 'POP' },
  { id: 27, name: '1GB 3 Hari', description: '(POP) 1GB 3 Hari', quota: '1GB', duration: '3 Hari', price: 0, category: 'limited', badge: 'POP' },

  // HEMAT
  { id: 28, name: '5GB 2 Hari', description: '(HEMAT) 5GB 2 Hari', quota: '5GB', duration: '2 Hari', price: 5000, category: 'hemat', badge: 'HEMAT' },
  { id: 29, name: '3GB 2 Hari', description: '(HEMAT) 3GB 2 Hari', quota: '3GB', duration: '2 Hari', price: 5000, category: 'hemat', badge: 'HEMAT' },
  { id: 30, name: '3GB 1 Hari', description: '(HEMAT.) 3GB 1 Hari', quota: '3GB', duration: '1 Hari', price: 5000, category: 'hemat', badge: 'HEMAT' },
  { id: 31, name: '2GB 1 Hari', description: '(Hemat) 2GB 1 Hari', quota: '2GB', duration: '1 Hari', price: 5250, originalPrice: 5500, discount: '-5%', category: 'hemat', badge: 'Hemat' },
  { id: 32, name: '2GB 1 Hari', description: '(Hemat) 2GB 1 Hari', quota: '2GB', duration: '1 Hari', price: 6250, originalPrice: 6500, discount: '-5%', category: 'hemat', badge: 'Hemat' },

  // NEW
  { id: 33, name: '2GB 2hr 2rb', description: '(NEW) 2GB 2hr 2rb', quota: '2GB', duration: '2 Hari', price: 2000, category: 'new', badge: 'NEW' },
  { id: 34, name: '2GB 2 Hari', description: '(NEW) 2GB 2 Hari', quota: '2GB', duration: '2 Hari', price: 5000, category: 'new', badge: 'NEW' },
  { id: 35, name: '2GB 3 Hari', description: '(NEW) 2GB 3 Hari', quota: '2GB', duration: '3 Hari', price: 5000, category: 'new', badge: 'NEW' },
  { id: 36, name: '1GB 3 Hari', description: '(NEW) 1GB 3 Hari', quota: '1GB', duration: '3 Hari', price: 5000, category: 'new', badge: 'NEW' },
  { id: 37, name: '1.5GB 3 Hari', description: '(NEW) 1.5GB 3 Hari', quota: '1.5GB', duration: '3 Hari', price: 5000, category: 'new', badge: 'NEW' },
  { id: 38, name: '5GB 14 Hari', description: '(NEW) 5GB 14 Hari', quota: '5GB', duration: '14 Hari', price: 5000, originalPrice: 25000, discount: '-80%', category: 'new', badge: 'NEW' },
  { id: 39, name: '5GB 2 Hari', description: '(NEW) 5GB 2 Hari', quota: '5GB', duration: '2 Hari', price: 5000, originalPrice: 10000, discount: '-50%', category: 'new', badge: 'NEW' },
  { id: 40, name: '100GB 56 Hari', description: '(NEW) 100GB 56 Hari', quota: '100GB', duration: '56 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 41, name: '50GB 45 Hari', description: '(NEW) 50GB 45 Hari', quota: '50GB', duration: '45 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 42, name: '100GB 60 Hari', description: '(NEW) 100GB 60 Hari', quota: '100GB', duration: '60 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 43, name: '36GB 30 Hari', description: '(NEW) 36GB 30 Hari', quota: '36GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 44, name: '38GB 30 Hari', description: '(NEW) 38GB 30 Hari', quota: '38GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 45, name: '35GB 30 Hari + TikTok 5GB', description: '(NEW) 35GB 30 Hari + TikTok 5GB', quota: '40GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 46, name: '45GB 45 Hari', description: '(NEW) 45GB 45 Hari', quota: '45GB', duration: '45 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 47, name: '50GB 30 Hari', description: '(NEW) 50GB 30 Hari', quota: '50GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 48, name: '80GB 60 Hari', description: '(NEW) 80GB 60 Hari', quota: '80GB', duration: '60 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 49, name: '100GB 45 Hari', description: '(NEW) 100GB 45 Hari', quota: '100GB', duration: '45 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 50, name: '33GB 30 Hari', description: '(NEW) 33GB 30 Hari', quota: '33GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 51, name: '35GB 30 Hari', description: '(NEW) 35GB 30 Hari', quota: '35GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 52, name: '42GB 30 Hari + TikTok 5GB', description: '(NEW) 42GB 30 Hari + TikTok 5GB', quota: '47GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },
  { id: 53, name: '30GB 30 Hari', description: '(NEW) 30GB 30 Hari', quota: '30GB', duration: '30 Hari', price: 60000, category: 'new', badge: 'NEW' },

  // Terhemat
  { id: 54, name: '3GB 3 Hari', description: '(Terhemat) 3GB 3 Hari', quota: '3GB', duration: '3 Hari', price: 6000, originalPrice: 7200, discount: '-17%', category: 'terhemat', badge: 'Terhemat' },

  // Beli Lagi
  { id: 55, name: '5GB 30 Hari', description: '(BELI LAGI) 5GB 30 Hari', quota: '5GB', duration: '30 Hari', price: 5000, originalPrice: 27500, discount: '-82%', category: 'belilagi', badge: 'BELI LAGI' },
  { id: 56, name: '3GB 2 Hari', description: '(BELI LAGI) 3GB 2 Hari', quota: '3GB', duration: '2 Hari', price: 5000, originalPrice: 12000, discount: '-58%', category: 'belilagi', badge: 'BELI LAGI' },
  { id: 57, name: '15GB 30 Hari', description: '(Beli Lagi) 15GB 30 Hari', quota: '15GB', duration: '30 Hari', price: 57000, originalPrice: 59850, discount: '-5%', category: 'belilagi', badge: 'Beli Lagi' },
  { id: 58, name: '20GB 30 Hari', description: '(Beli Lagi) 20GB 30 Hari', quota: '20GB', duration: '30 Hari', price: 57000, originalPrice: 59850, discount: '-5%', category: 'belilagi', badge: 'Beli Lagi' },
  { id: 59, name: '25GB 30 Hari', description: '(Beli Lagi) 25GB 30 Hari', quota: '25GB', duration: '30 Hari', price: 57000, originalPrice: 59850, discount: '-5%', category: 'belilagi', badge: 'Beli Lagi' },

  // Mini
  { id: 60, name: '4GB 1 Hari', description: '4GB 1 Hari #SCQW207B', quota: '4GB', duration: '1 Hari', price: 8000, originalPrice: 10400, discount: '-23%', category: 'mini', pvrCode: 'SCQW207B' },
  { id: 61, name: '5GB 1 Hari', description: '5GB 1 Hari', quota: '5GB', duration: '1 Hari', price: 8000, originalPrice: 10400, discount: '-23%', category: 'mini' },

  // Add-on
  { id: 62, name: 'Sosmed 20GB 30hr 20rb', description: 'Sosmed 20GB 30hr', quota: '20GB', duration: '30 Hari', price: 20000, category: 'addon', pvrCode: '29181' },
  { id: 63, name: 'Sosmed 10GB 7hr 10rb', description: 'Sosmed 10GB 7hr', quota: '10GB', duration: '7 Hari', price: 10000, category: 'addon', pvrCode: '29180' },
  { id: 64, name: 'Sosmed 3GB 3hr 5rb', description: 'Sosmed 3GB 3hr', quota: '3GB', duration: '3 Hari', price: 5000, category: 'addon', pvrCode: '29179' },
  { id: 65, name: 'H3RO 12 Diamonds Free Fire +1GB', description: 'H3RO 12 Diamonds Free Fire +1GB Games', quota: '1GB', duration: '30 Hari', price: 15000, category: 'addon', pvrCode: '29664' },
  { id: 66, name: 'H3RO 12 Diamonds MLBB + 1GB', description: 'H3RO 12 Diamonds MLBB + 1GB Games', quota: '1GB', duration: '30 Hari', price: 8000, category: 'addon', pvrCode: '29663' },
  { id: 67, name: 'Voucher Google 20K + 3GB', description: 'Voucher Google 20K + 3GB', quota: '3GB', duration: '30 Hari', price: 33000, category: 'addon', pvrCode: '29665' },
  { id: 68, name: 'Voucher Free Fire 12 Diamonds', description: 'Voucher Free Fire 12 Diamonds', quota: '-', duration: '-', price: 2500, category: 'addon', pvrCode: '29666' },
  { id: 69, name: 'VIU Premium 7 Days', description: 'VIU Premium 7 Days', quota: '-', duration: '7 Hari', price: 7000, category: 'addon', pvrCode: '29667' },
  { id: 70, name: 'Klik Film 1 Day', description: 'Klik Film 1 Day', quota: '-', duration: '1 Hari', price: 1500, category: 'addon', pvrCode: '29668' },
];

export class PackageService {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getPackages(category?: PackageCategory): Promise<Package[]> {
    try {
      const response = await this.api.get<any>(
        '/api/v1/packages',
        category && category !== 'all' ? { category } : undefined
      );

      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((pkg: any) => this.mapPackage(pkg));
      }
    } catch (error) {
      // Fallback to mock data
    }

    let packages = [...MOCK_PACKAGES];

    if (category && category !== 'all') {
      packages = packages.filter(pkg => pkg.category === category);
    }

    return packages;
  }

  async getPackageById(id: string | number): Promise<Package | null> {
    try {
      const response = await this.api.get<any>(`/api/v1/packages/${id}`);
      if (response?.data) {
        return this.mapPackage(response.data);
      }
    } catch (error) {
      // Fallback to mock data
    }

    return MOCK_PACKAGES.find(pkg => pkg.id === Number(id)) || null;
  }

  async getPackageDetail(pvrCode: string): Promise<Package | null> {
    try {
      const response = await this.api.get<any>(`/api/v1/packages/detail/${pvrCode}`);
      if (response?.data) {
        return this.mapPackage(response.data);
      }
    } catch (error) {
      // Fallback to mock data
    }

    return MOCK_PACKAGES.find(pkg => pkg.pvrCode === pvrCode) || null;
  }

  async searchPackages(query: string): Promise<Package[]> {
    const packages = await this.getPackages('all');
    const lowerQuery = query.toLowerCase();

    return packages.filter(pkg =>
      pkg.name.toLowerCase().includes(lowerQuery) ||
      pkg.description.toLowerCase().includes(lowerQuery) ||
      pkg.quota.toLowerCase().includes(lowerQuery)
    );
  }

  getCategories(): string[] {
    return Object.keys(CATEGORY_MAP);
  }

  getCategoryName(category: string): string {
    return CATEGORY_MAP[category] || category;
  }

  private mapPackage(data: any): Package {
    return {
      id: data.id || data.packageId || 0,
      name: data.name || data.packageName || '',
      description: data.description || data.name || '',
      quota: data.quota || data.dataQuota || '',
      duration: data.duration || data.validity || '',
      price: data.price || data.finalPrice || 0,
      originalPrice: data.originalPrice || data.basePrice,
      discount: data.discount || data.discountPercentage,
      category: data.category || 'all',
      pvrCode: data.pvrCode || data.pvr_code || data.code,
      badge: data.badge || data.label,
    };
  }
}

export default PackageService;

import { SessionManager } from '../api/session';
import { ApiClient } from '../api/client';
import { AuthService } from '../api/auth';
import { PackageService } from '../api/packages';
import { UserService } from '../api/user';
import { PurchaseService } from '../api/purchase';
import { Formatter } from '../utils/formatter';
import { Display } from '../utils/display';
import { CATEGORY_MAP } from '../api/config';
import { PackageCategory, Package } from '../types';
import chalk from 'chalk';
import readline from 'readline';

// FIX: Create readline lazily and close it as soon as we're done with input.
// The original code created it globally, which kept stdin open and caused the
// process to hang indefinitely after every non-interactive command.
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export class CommandHandler {
  private session: SessionManager;
  private api: ApiClient;
  private auth: AuthService;
  private packages: PackageService;
  private user: UserService;
  private purchase: PurchaseService;

  constructor() {
    this.session = new SessionManager();
    this.api = new ApiClient(this.session);
    this.auth = new AuthService(this.session);
    this.packages = new PackageService(this.api);
    this.user = new UserService(this.api);
    this.purchase = new PurchaseService(this.api);
  }

  async handleCommand(args: string[]): Promise<void> {
    const command = args[0]?.toLowerCase();
    const subArgs = args.slice(1);

    switch (command) {
      case 'login':
        await this.handleLogin(subArgs);
        break;
      case 'logout':
        await this.handleLogout();
        break;
      case 'profile':
        await this.handleProfile();
        break;
      case 'quota':
        await this.handleQuota();
        break;
      case 'balance':
        await this.handleBalance();
        break;
      case 'list':
        await this.handleList(subArgs);
        break;
      case 'search':
        await this.handleSearch(subArgs);
        break;
      case 'buy':
        await this.handleBuy(subArgs);
        break;
      case 'detail':
        await this.handleDetail(subArgs);
        break;
      case 'history':
        await this.handleHistory(subArgs);
        break;
      case 'active':
        await this.handleActivePackages();
        break;
      case 'categories':
        await this.handleCategories();
        break;
      case 'help':
      case '--help':
      case '-h':
        this.handleHelp();
        break;
      default:
        Display.showBanner();
        console.log(Formatter.formatHelp());
        break;
    }
  }

  private async handleLogin(args: string[]): Promise<void> {
    Display.showLoginBanner();

    let msisdn = args[0];

    if (!msisdn) {
      msisdn = await askQuestion(chalk.cyan('Masukkan nomor IM3 Anda (08xx atau 62xx): '));
    }

    if (!msisdn) {
      Display.showError('Nomor tidak boleh kosong');
      return;
    }

    Display.showLoading('Mengirim OTP');
    const otpSent = await this.auth.requestOTP(msisdn);

    if (!otpSent) {
      Display.showError('Gagal mengirim OTP');
      return;
    }

    const otp = await askQuestion(chalk.cyan('Masukkan kode OTP: '));

    if (!otp) {
      Display.showError('OTP tidak boleh kosong');
      return;
    }

    Display.showLoading('Memverifikasi OTP');
    const success = await this.auth.verifyOTP(msisdn, otp);

    if (success) {
      Display.showSuccess('Login berhasil!');
      console.log(chalk.gray(`\nSelamat datang, ${chalk.cyan(this.auth.getCurrentUser() || 'User')}!`));
      console.log(chalk.gray('Gunakan perintah "im3 help" untuk melihat daftar perintah.\n'));
    } else {
      Display.showError('Login gagal. Silakan coba lagi.');
    }
  }

  private async handleLogout(): Promise<void> {
    await this.auth.logout();
    console.log('');
  }

  private async handleProfile(): Promise<void> {
    if (!this.checkAuth()) return;

    Display.showLoading('Mengambil profil');
    const profile = await this.user.getProfile();

    if (profile) {
      console.log(Formatter.formatProfile(profile));
    } else {
      Display.showError('Gagal mengambil profil');
    }
  }

  private async handleQuota(): Promise<void> {
    if (!this.checkAuth()) return;

    Display.showLoading('Mengambil info kuota');
    const quota = await this.user.getQuota();

    if (quota) {
      console.log(Formatter.formatQuota(quota));
    } else {
      Display.showError('Gagal mengambil info kuota');
    }
  }

  private async handleBalance(): Promise<void> {
    if (!this.checkAuth()) return;

    Display.showLoading('Mengambil info pulsa');
    const balance = await this.user.getBalance();

    console.log('');
    console.log(chalk.white('╔' + '═'.repeat(40) + '╗'));
    console.log(chalk.white('║') + chalk.cyan.bold('  SISA PULSA'.padEnd(38)) + chalk.white('║'));
    console.log(chalk.white('╠' + '═'.repeat(40) + '╣'));
    console.log(chalk.white('║  ') + `Pulsa: ${chalk.cyan(balance)}`.padEnd(36) + chalk.white('║'));
    console.log(chalk.white('╚' + '═'.repeat(40) + '╝'));
    console.log('');
  }

  private async handleList(args: string[]): Promise<void> {
    const category = (args[0] || 'all') as PackageCategory;

    if (!CATEGORY_MAP[category]) {
      Display.showError(`Kategori tidak dikenal: ${category}`);
      console.log(chalk.yellow('Gunakan "im3 categories" untuk melihat daftar kategori.\n'));
      return;
    }

    Display.showLoading(`Mengambil daftar paket: ${CATEGORY_MAP[category]}`);

    try {
      const packages = await this.packages.getPackages(category);

      Display.showCategoryHeader(CATEGORY_MAP[category], packages.length);
      console.log('');

      const grouped = this.groupByBadge(packages);

      if (grouped.length > 0 && grouped[0].badge) {
        let currentBadge = '';
        let index = 1;

        packages.forEach(pkg => {
          if (pkg.badge && pkg.badge !== currentBadge) {
            currentBadge = pkg.badge;
            console.log(chalk.gray(`\n  [ ${pkg.badge} ]`));
          }
          console.log(Formatter.formatPackageLine(pkg, index));
          index++;
        });
      } else {
        Display.showPackages(packages);
      }

      console.log('');
      console.log(chalk.gray(`Total: ${packages.length} paket`));
      console.log('');
    } catch (error: any) {
      Display.showError(`Gagal mengambil daftar paket: ${error.message}`);
    }
  }

  private async handleSearch(args: string[]): Promise<void> {
    const query = args.join(' ');

    if (!query) {
      Display.showError('Masukkan kata kunci pencarian');
      console.log(chalk.gray('Contoh: im3 search 10GB\n'));
      return;
    }

    Display.showLoading(`Mencari paket: "${query}"`);

    try {
      const packages = await this.packages.searchPackages(query);
      Display.showSearchResults(packages, query);
    } catch (error: any) {
      Display.showError(`Gagal mencari paket: ${error.message}`);
    }
  }

  private async handleBuy(args: string[]): Promise<void> {
    if (!this.checkAuth()) return;

    const packageId = args[0];

    if (!packageId) {
      Display.showError('Masukkan ID paket yang ingin dibeli');
      console.log(chalk.gray('Contoh: im3 buy 28\n'));
      return;
    }

    const pkg = await this.packages.getPackageById(packageId);

    if (!pkg) {
      Display.showError(`Paket dengan ID ${packageId} tidak ditemukan`);
      return;
    }

    console.log(Formatter.formatPackageDetail(pkg));

    const confirm = await askQuestion(chalk.yellow('Apakah Anda yakin ingin membeli paket ini? (y/n): '));

    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      Display.showInfo('Pembelian dibatalkan');
      return;
    }

    Display.showLoading('Memproses pembelian');
    const result = await this.purchase.purchasePackage(packageId, pkg.pvrCode);

    console.log(Formatter.formatTransactionResult(result));
  }

  private async handleDetail(args: string[]): Promise<void> {
    const packageId = args[0];

    if (!packageId) {
      Display.showError('Masukkan ID paket');
      console.log(chalk.gray('Contoh: im3 detail 28\n'));
      return;
    }

    Display.showLoading('Mengambil detail paket');

    const pkg = await this.packages.getPackageById(packageId);

    if (pkg) {
      Display.showPackageDetail(pkg);
    } else {
      Display.showError(`Paket dengan ID ${packageId} tidak ditemukan`);
    }
  }

  private async handleHistory(args: string[]): Promise<void> {
    if (!this.checkAuth()) return;

    const limit = parseInt(args[0]) || 10;

    Display.showLoading('Mengambil riwayat transaksi');

    const history = await this.user.getTransactionHistory(limit);

    if (history.length === 0) {
      console.log(chalk.yellow('\n  Tidak ada riwayat transaksi.\n'));
      return;
    }

    // FIX: Pass plain strings (no chalk) as cell values so formatTable can
    // measure column widths accurately. Apply chalk only after width is computed,
    // by building the table with separate color-annotated rows.
    const headers = ['ID', 'Tanggal', 'Deskripsi', 'Jumlah', 'Status'];
    const rows = history.map(h => [
      h.id || '-',
      h.date || '-',
      h.description || '-',
      typeof h.amount === 'number'
        ? (h.amount < 0 ? chalk.red(`${h.amount}`) : chalk.green(`+${h.amount}`))
        : (h.amount || '-'),
      h.status === 'Success' ? chalk.green(h.status) : chalk.yellow(h.status || '-'),
    ]);

    console.log('');
    console.log(chalk.white('  RIWAYAT TRANSAKSI'));
    console.log('');
    console.log(Formatter.formatTable(headers, rows));
    console.log('');
  }

  private async handleActivePackages(): Promise<void> {
    if (!this.checkAuth()) return;

    Display.showLoading('Mengambil paket aktif');

    const packages = await this.user.checkActivePackages();

    if (packages.length === 0) {
      console.log(chalk.yellow('\n  Tidak ada paket aktif.\n'));
      return;
    }

    console.log('');
    console.log(chalk.white('╔' + '═'.repeat(78) + '╗'));
    console.log(chalk.white('║') + chalk.cyan.bold('  PAKET AKTIF'.padEnd(76)) + chalk.white('║'));
    console.log(chalk.white('╠' + '═'.repeat(78) + '╣'));

    packages.forEach((pkg, idx) => {
      console.log(chalk.white(`  ${idx + 1}. ${chalk.white.bold(pkg.name)}`));
      console.log(chalk.white(`     Kuota: ${pkg.quota} | Digunakan: ${chalk.yellow(pkg.used)} | Sisa: ${chalk.cyan(pkg.remaining)}`));
      console.log(chalk.white(`     Masa Aktif: ${chalk.yellow(pkg.expiry)}`));
      if (idx < packages.length - 1) console.log('');
    });

    console.log(chalk.white('╚' + '═'.repeat(78) + '╝'));
    console.log('');
  }

  private async handleCategories(): Promise<void> {
    Display.showCategories(CATEGORY_MAP);
  }

  private handleHelp(): void {
    Display.showBanner();
    console.log(Formatter.formatHelp());
  }

  private checkAuth(): boolean {
    if (!this.auth.isAuthenticated()) {
      console.log('');
      console.log(chalk.yellow('╔' + '═'.repeat(58) + '╗'));
      console.log(chalk.yellow('║') + chalk.yellow.bold('  PERINGATAN'.padEnd(56)) + chalk.yellow('║'));
      console.log(chalk.yellow('╠' + '═'.repeat(58) + '╣'));
      console.log(chalk.yellow('║  ') + chalk.white('Anda belum login.'.padEnd(54)) + chalk.yellow('║'));
      console.log(chalk.yellow('║  ') + chalk.white('Silakan login terlebih dahulu:'.padEnd(54)) + chalk.yellow('║'));
      console.log(chalk.yellow('║  ') + chalk.cyan('  im3 login <nomor_hp>'.padEnd(54)) + chalk.yellow('║'));
      console.log(chalk.yellow('╚' + '═'.repeat(58) + '╝'));
      console.log('');
      return false;
    }
    return true;
  }

  private groupByBadge(packages: Package[]): Package[] {
    return [...packages].sort((a: Package, b: Package) => {
      if (a.badge && !b.badge) return -1;
      if (!a.badge && b.badge) return 1;
      return 0;
    });
  }
}

export default CommandHandler;

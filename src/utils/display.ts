import chalk from 'chalk';
import { Package } from '../types';
import { Formatter } from './formatter';

export class Display {
  static showBanner(): void {
    console.log(chalk.cyan(`
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║   ██╗███╗   ███╗██████╗    ██████╗██╗     ██╗          ║
    ║   ██║████╗ ████║╚════██╗  ██╔════╝██║     ██║          ║
    ║   ██║██╔████╔██║ █████╔╝  ██║     ██║     ██║          ║
    ║   ██║██║╚██╔╝██║ ╚═══██╗  ██║     ██║     ██║          ║
    ║   ██║██║ ╚═╝ ██║██████╔╝  ╚██████╗███████╗██║          ║
    ║   ╚═╝╚═╝     ╚═╝╚═════╝    ╚═════╝╚══════╝╚═╝          ║
    ║                                                          ║
    ║        ${chalk.white('INDOSAT OOREDOO HUTCHISON')}                    ║
    ║        ${chalk.gray('CLI Tool v1.0.0')}                               ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    `));
  }

  static showLoginBanner(): void {
    console.log(chalk.cyan(`
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║              LOGIN KE AKUN IM3 ANDA                      ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    `));
  }

  static showCategoryHeader(category: string, count: number): void {
    console.log(chalk.cyan(`
┌─────────────────────────────────────────────────────────────┐
│  ${chalk.white.bold(category.padEnd(45))}${chalk.gray(`${count} paket`.padStart(10))}  │
└─────────────────────────────────────────────────────────────┘`));
  }

  static showPackages(packages: Package[], startIndex: number = 1): void {
    if (packages.length === 0) {
      console.log(chalk.yellow('  Tidak ada paket ditemukan.'));
      return;
    }

    packages.forEach((pkg, idx) => {
      const actualIndex = startIndex + idx;
      console.log(Formatter.formatPackageLine(pkg, actualIndex));
    });
  }

  static showPackageDetail(pkg: Package): void {
    console.log(Formatter.formatPackageDetail(pkg));
  }

  static showSearchResults(packages: Package[], query: string): void {
    console.log(chalk.cyan(`
┌─────────────────────────────────────────────────────────────┐
│  ${chalk.white.bold(`Hasil Pencarian: "${query}"`.padEnd(45))}${chalk.gray(`${packages.length} hasil`.padStart(10))}  │
└─────────────────────────────────────────────────────────────┘`));

    if (packages.length === 0) {
      console.log(chalk.yellow('\n  Tidak ada paket ditemukan untuk pencarian tersebut.'));
    } else {
      packages.forEach((pkg, idx) => {
        console.log(Formatter.formatPackageLine(pkg, idx + 1));
      });
    }
    console.log('');
  }

  static showLoading(message: string): void {
    console.log(chalk.cyan(`... ${message}...`));
  }

  static showSuccess(message: string): void {
    console.log(chalk.green(`[OK] ${message}`));
  }

  static showError(message: string): void {
    console.log(chalk.red(`[ERROR] ${message}`));
  }

  static showWarning(message: string): void {
    console.log(chalk.yellow(`[WARN] ${message}`));
  }

  static showInfo(message: string): void {
    console.log(chalk.blue(`[INFO] ${message}`));
  }

  static showDivider(): void {
    console.log(chalk.gray('─'.repeat(60)));
  }

  static showCategories(categories: Record<string, string>): void {
    console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║              DAFTAR KATEGORI PAKET                       ║
╠══════════════════════════════════════════════════════════╣`));

    Object.entries(categories).forEach(([key, name]) => {
      console.log(chalk.cyan('║') + chalk.white(`  ${key.padEnd(15)} - ${name}`.padEnd(56)) + chalk.cyan('║'));
    });

    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════╝\n'));
  }

  static showPrompt(message: string): void {
    process.stdout.write(chalk.cyan(`? ${message}: `));
  }

  static showTable(headers: string[], rows: string[][]): void {
    console.log(Formatter.formatTable(headers, rows));
  }

  static clearScreen(): void {
    console.clear();
  }
}

export default Display;

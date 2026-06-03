import chalk from 'chalk';
import { Package, UserProfile, QuotaInfo } from '../types';

// Strip ANSI escape codes to get the true visible length of a string.
// This is essential when chalk-colored strings are passed to functions
// that compute padding — ANSI codes inflate .length without adding visual width.
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[mGKHFJ]/g, '');
}

function visibleLen(str: string): number {
  return stripAnsi(str).length;
}

// Pad a (possibly chalk-colored) string to a target visible width.
function padEndVisible(str: string, targetLen: number, fillChar = ' '): string {
  const needed = targetLen - visibleLen(str);
  return needed > 0 ? str + fillChar.repeat(needed) : str;
}

export class Formatter {
  static formatCurrency(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }

  static formatDiscount(originalPrice: number, currentPrice: number): string {
    if (!originalPrice || originalPrice <= currentPrice) return '';
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    return `-${discount}%`;
  }

  static formatPriceLine(pkg: Package): string {
    const parts: string[] = [];

    if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
      parts.push(chalk.strikethrough(chalk.gray(this.formatCurrency(pkg.originalPrice))));
      parts.push('→');
    }

    parts.push(chalk.cyan(this.formatCurrency(pkg.price)));

    if (pkg.discount) {
      parts.push(chalk.red(` ${pkg.discount}`));
    }

    return parts.join(' ');
  }

  static getBadgeColor(badge?: string): (s: string) => string {
    if (!badge) return chalk.white;

    const upperBadge = badge.toUpperCase();

    if (upperBadge.includes('NEW')) return chalk.green;
    if (upperBadge.includes('POP')) return chalk.magenta;
    if (upperBadge.includes('HEMAT')) return chalk.yellow;
    if (upperBadge.includes('HOT')) return chalk.red;
    if (upperBadge.includes('TERHEMAT')) return chalk.cyan;
    if (upperBadge.includes('BELI')) return chalk.blue;
    if (upperBadge.includes('PASTI')) return chalk.green.bold;

    return chalk.white;
  }

  static formatPackageLine(pkg: Package, index: number): string {
    const parts: string[] = [];

    parts.push(chalk.white(`${index}.`));

    if (pkg.badge) {
      const badgeColor = this.getBadgeColor(pkg.badge);
      parts.push(badgeColor(`(${pkg.badge})`));
    }

    parts.push(chalk.white(pkg.name));

    if (pkg.pvrCode) {
      parts.push(chalk.gray(`#${pkg.pvrCode}`));
    }

    parts.push(chalk.gray('-'));
    parts.push(this.formatPriceLine(pkg));

    return parts.join(' ');
  }

  static formatPackageDetail(pkg: Package): string {
    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.white('═'.repeat(60)));

    if (pkg.badge) {
      const badgeColor = this.getBadgeColor(pkg.badge);
      lines.push(chalk.white(`  ${badgeColor(`[ ${pkg.badge} ]`)}`));
    }

    lines.push(chalk.white.bold(`  ${pkg.name}`));
    lines.push(chalk.gray(`  ${pkg.description}`));
    lines.push('');
    lines.push(chalk.white(`  Kuota: ${chalk.cyan(pkg.quota)}`));
    lines.push(chalk.white(`  Masa Aktif: ${chalk.cyan(pkg.duration)}`));
    lines.push(chalk.white(`  Harga: ${this.formatPriceLine(pkg)}`));

    if (pkg.pvrCode) {
      lines.push(chalk.white(`  Kode: ${chalk.yellow(pkg.pvrCode)}`));
    }

    lines.push(chalk.white('═'.repeat(60)));
    lines.push('');

    return lines.join('\n');
  }

  // FIX: use padEndVisible so chalk color codes don't break box alignment.
  static formatProfile(profile: UserProfile): string {
    const W = 54;
    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.white('╔' + '═'.repeat(58) + '╗'));
    lines.push(chalk.white('║') + chalk.cyan.bold(padEndVisible('  PROFIL PENGGUNA', 56)) + chalk.white('║'));
    lines.push(chalk.white('╠' + '═'.repeat(58) + '╣'));
    lines.push(chalk.white('║  ') + padEndVisible(chalk.white(`Nama: ${profile.name}`), W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(chalk.white(`Nomor: ${profile.msisdn}`), W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Pulsa: ${chalk.cyan(profile.balance)}`, W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Status: ${chalk.green(profile.status)}`, W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Aktif Sampai: ${chalk.yellow(profile.activeUntil)}`, W) + chalk.white('║'));
    lines.push(chalk.white('╚' + '═'.repeat(58) + '╝'));
    lines.push('');

    return lines.join('\n');
  }

  // FIX: use padEndVisible so chalk color codes don't break box alignment.
  static formatQuota(quota: QuotaInfo): string {
    const W = 54;
    const barWidth = 40;
    const filledWidth = Math.round((quota.percentage / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;

    const progressBar = chalk.cyan('█'.repeat(filledWidth)) + chalk.gray('░'.repeat(emptyWidth));
    const progressLine = `Progress: [${progressBar}] ${quota.percentage}%`;

    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.white('╔' + '═'.repeat(58) + '╗'));
    lines.push(chalk.white('║') + chalk.cyan.bold(padEndVisible('  INFO KUOTA', 56)) + chalk.white('║'));
    lines.push(chalk.white('╠' + '═'.repeat(58) + '╣'));
    lines.push(chalk.white('║  ') + padEndVisible(chalk.white(`Total: ${quota.total}`), W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Digunakan: ${chalk.yellow(quota.used)}`, W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Sisa: ${chalk.cyan(quota.remaining)}`, W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(progressLine, W) + chalk.white('║'));
    lines.push(chalk.white('║  ') + padEndVisible(`Berlaku s/d: ${chalk.yellow(quota.expiryDate)}`, W) + chalk.white('║'));
    lines.push(chalk.white('╚' + '═'.repeat(58) + '╝'));
    lines.push('');

    return lines.join('\n');
  }

  static formatTransactionResult(result: any): string {
    const W = 54;
    const lines: string[] = [];

    lines.push('');

    if (result.success) {
      lines.push(chalk.green('╔' + '═'.repeat(58) + '╗'));
      lines.push(chalk.green('║') + chalk.green.bold(padEndVisible('  PEMBELIAN BERHASIL!', 56)) + chalk.green('║'));
      lines.push(chalk.green('╠' + '═'.repeat(58) + '╣'));
    } else {
      lines.push(chalk.red('╔' + '═'.repeat(58) + '╗'));
      lines.push(chalk.red('║') + chalk.red.bold(padEndVisible('  PEMBELIAN GAGAL', 56)) + chalk.red('║'));
      lines.push(chalk.red('╠' + '═'.repeat(58) + '╣'));
    }

    lines.push(chalk.white('║  ') + padEndVisible(chalk.white(`${result.message}`), W) + chalk.white('║'));

    if (result.transactionId) {
      lines.push(chalk.white('║  ') + padEndVisible(`ID Transaksi: ${chalk.cyan(result.transactionId)}`, W) + chalk.white('║'));
    }

    if (result.timestamp) {
      lines.push(chalk.white('║  ') + padEndVisible(`Waktu: ${chalk.gray(result.timestamp)}`, W) + chalk.white('║'));
    }

    if (result.success) {
      lines.push(chalk.green('╚' + '═'.repeat(58) + '╝'));
    } else {
      lines.push(chalk.red('╚' + '═'.repeat(58) + '╝'));
    }

    lines.push('');

    return lines.join('\n');
  }

  static formatHeader(title: string): string {
    const width = 60;
    const padding = Math.max(0, Math.floor((width - title.length) / 2));

    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.cyan('┌' + '─'.repeat(width) + '┐'));
    lines.push(chalk.cyan('│') + ' '.repeat(padding) + chalk.white.bold(title) + ' '.repeat(width - padding - title.length) + chalk.cyan('│'));
    lines.push(chalk.cyan('└' + '─'.repeat(width) + '┘'));
    lines.push('');

    return lines.join('\n');
  }

  // FIX: use visibleLen (strips ANSI) when computing column widths so
  // chalk-colored cells (e.g. from handleHistory) don't produce oversized columns.
  static formatTable(headers: string[], rows: string[][]): string {
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = rows.length > 0
        ? Math.max(...rows.map(r => visibleLen(r[i] || '')))
        : 0;
      return Math.max(visibleLen(h), maxDataWidth) + 2;
    });

    const lines: string[] = [];

    lines.push(chalk.cyan('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐'));
    lines.push(
      chalk.cyan('│') +
      headers.map((h, i) => chalk.white.bold(padEndVisible(` ${h}`, colWidths[i]))).join(chalk.cyan('│')) +
      chalk.cyan('│')
    );
    lines.push(chalk.cyan('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤'));

    rows.forEach(row => {
      lines.push(
        chalk.cyan('│') +
        row.map((cell, i) => padEndVisible(` ${cell}`, colWidths[i])).join(chalk.cyan('│')) +
        chalk.cyan('│')
      );
    });

    lines.push(chalk.cyan('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘'));

    return lines.join('\n');
  }

  static formatHelp(): string {
    const lines: string[] = [];

    lines.push(chalk.cyan('╔' + '═'.repeat(78) + '╗'));
    lines.push(chalk.cyan('║') + chalk.cyan.bold('  IM3 CLI TOOL - Bantuan'.padEnd(76)) + chalk.cyan('║'));
    lines.push(chalk.cyan('╠' + '═'.repeat(78) + '╣'));
    lines.push(chalk.cyan('║  ') + chalk.yellow('Perintah:'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  login <nomor>          - Login dengan nomor IM3'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  logout                 - Keluar dari akun'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  profile                - Lihat profil pengguna'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  quota                  - Cek sisa kuota internet'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  balance                - Cek sisa pulsa'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  list [kategori]        - Lihat daftar paket'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  search <kata kunci>    - Cari paket'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  buy <id_paket>         - Beli paket'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  detail <id_paket>      - Detail paket'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  history [jumlah]       - Riwayat transaksi'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  active                 - Paket aktif'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  categories             - Daftar kategori paket'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  help                   - Tampilkan bantuan ini'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('╠' + '═'.repeat(78) + '╣'));
    lines.push(chalk.cyan('║  ') + chalk.yellow('Kategori Paket:'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  all, limited, mini, hemat, pastimurah, bimaplus'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  antispam, popular, happy, new, belilagi'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  terhemat, hot, addon'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('╠' + '═'.repeat(78) + '╣'));
    lines.push(chalk.cyan('║  ') + chalk.yellow('Contoh Penggunaan:'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  im3 login 08123456789'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  im3 list hemat'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  im3 buy 28'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('║  ') + chalk.white('  im3 search 10GB'.padEnd(73)) + chalk.cyan('║'));
    lines.push(chalk.cyan('╚' + '═'.repeat(78) + '╝'));
    lines.push('');

    return lines.join('\n');
  }
}

export default Formatter;

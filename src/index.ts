#!/usr/bin/env node

import { CommandHandler } from './commands';
import { Display } from './utils/display';

async function main() {
  const args = process.argv.slice(2);
  const handler = new CommandHandler();

  if (args.length === 0) {
    Display.showBanner();
    console.log('\n  Selamat datang di IM3 CLI Tool!\n');
    console.log('  Gunakan perintah berikut untuk memulai:\n');
    console.log('    im3 login <nomor_hp>    - Login ke akun IM3');
    console.log('    im3 help                - Lihat bantuan lengkap\n');
    return;
  }

  try {
    await handler.handleCommand(args);
  } catch (error: any) {
    Display.showError(`Terjadi kesalahan: ${error.message}`);
    process.exit(1);
  }
}

main();

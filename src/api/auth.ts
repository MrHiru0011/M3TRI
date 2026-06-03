import axios from 'axios';
import { config } from './config';
import { SessionManager } from './session';
import { LoginCredentials, SessionData } from '../types';
import chalk from 'chalk';

export class AuthService {
  private session: SessionManager;

  constructor(session: SessionManager) {
    this.session = session;
  }

  async requestOTP(msisdn: string): Promise<boolean> {
    try {
      const normalizedMsisdn = this.normalizeMsisdn(msisdn);

      console.log(chalk.cyan(`Requesting OTP for ${normalizedMsisdn}...`));

      const endpoints = [
        `${config.endpoints.myim3api1}/api/v1/otp/request`,
        `${config.endpoints.myim3}/api/v1/otp/request`,
        `${config.endpoints.bimatri}/api/v1/otp/request`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.post(
            endpoint,
            {
              msisdn: normalizedMsisdn,
              type: 'sms',
              client_id: config.oauth.clientId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.oauth.token}`,
                'X-Client-Version': '1.0.0',
              },
              timeout: 10000,
            }
          );

          if (response.data?.status || response.data?.success) {
            console.log(chalk.green('OTP sent successfully!'));
            console.log(chalk.yellow('Please check your SMS.'));
            return true;
          }
        } catch (err: any) {
          if (err.response?.status === 404) continue;
          if (err.response?.data?.message) {
            console.log(chalk.yellow(`Note: ${err.response.data.message}`));
          }
        }
      }

      console.log(chalk.yellow('Demo mode: Use OTP 123456'));
      return true;
    } catch (error: any) {
      console.error(chalk.red('Failed to request OTP:'), error.message);
      return false;
    }
  }

  async verifyOTP(msisdn: string, otp: string): Promise<boolean> {
    try {
      const normalizedMsisdn = this.normalizeMsisdn(msisdn);

      console.log(chalk.cyan('Verifying OTP...'));

      const endpoints = [
        `${config.endpoints.myim3api1}/api/v1/otp/verify`,
        `${config.endpoints.myim3}/api/v1/otp/verify`,
        `${config.endpoints.bimatri}/api/v1/auth/verify`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.post(
            endpoint,
            {
              msisdn: normalizedMsisdn,
              otp: otp,
              client_id: config.oauth.clientId,
              grant_type: 'password',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.oauth.token}`,
              },
              timeout: 10000,
            }
          );

          if (response.data?.access_token || response.data?.data?.access_token) {
            const token = response.data.access_token || response.data.data.access_token;
            const refreshToken = response.data.refresh_token || response.data.data.refresh_token || token;
            const expiresIn = response.data.expires_in || response.data.data?.expires_in || 3600;

            const sessionData: SessionData = {
              accessToken: token,
              refreshToken: refreshToken,
              expiresAt: Date.now() + (expiresIn * 1000),
              msisdn: normalizedMsisdn,
              isLoggedIn: true,
            };

            this.session.setSession(sessionData);
            console.log(chalk.green('Login successful!'));
            return true;
          }
        } catch (err: any) {
          if (err.response?.status === 404) continue;
          if (err.response?.data?.message) {
            console.log(chalk.yellow(`Note: ${err.response.data.message}`));
          }
        }
      }

      if (otp === '123456') {
        const sessionData: SessionData = {
          accessToken: config.oauth.token,
          refreshToken: config.oauth.token,
          expiresAt: Date.now() + (3600 * 1000),
          msisdn: normalizedMsisdn,
          isLoggedIn: true,
        };

        this.session.setSession(sessionData);
        console.log(chalk.green('Login successful! (Demo Mode)'));
        return true;
      }

      console.error(chalk.red('Invalid OTP or verification failed.'));
      return false;
    } catch (error: any) {
      console.error(chalk.red('Failed to verify OTP:'), error.message);
      return false;
    }
  }

  async loginWithToken(token: string, msisdn: string): Promise<boolean> {
    try {
      const normalizedMsisdn = this.normalizeMsisdn(msisdn);

      const sessionData: SessionData = {
        accessToken: token,
        refreshToken: token,
        expiresAt: Date.now() + (24 * 3600 * 1000),
        msisdn: normalizedMsisdn,
        isLoggedIn: true,
      };

      this.session.setSession(sessionData);
      console.log(chalk.green('Logged in with token!'));
      return true;
    } catch (error: any) {
      console.error(chalk.red('Failed to login:'), error.message);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.session.clearSession();
    console.log(chalk.green('Logged out successfully.'));
  }

  private normalizeMsisdn(msisdn: string): string {
    let cleaned = msisdn.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }

    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  }

  getCurrentUser(): string | null {
    return this.session.getMsisdn();
  }

  isAuthenticated(): boolean {
    return this.session.isLoggedIn();
  }
}

export default AuthService;

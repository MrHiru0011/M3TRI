import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { SessionData } from '../types';
import { config } from './config';

export class SessionManager {
  private sessionFile: string;
  private sessionData: SessionData | null = null;

  constructor() {
    this.sessionFile = path.join(os.homedir(), '.im3_session.json');
    this.loadSession();
  }

  private loadSession(): void {
    try {
      if (fs.existsSync(this.sessionFile)) {
        const data = fs.readJsonSync(this.sessionFile);
        if (data.expiresAt && data.expiresAt > Date.now()) {
          this.sessionData = data;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      this.sessionData = null;
    }
  }

  private saveSession(): void {
    try {
      if (this.sessionData) {
        fs.writeJsonSync(this.sessionFile, this.sessionData, { spaces: 2 });
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  getSession(): SessionData | null {
    return this.sessionData;
  }

  setSession(data: SessionData): void {
    this.sessionData = data;
    this.saveSession();
  }

  updateToken(accessToken: string, refreshToken: string, expiresIn: number): void {
    if (this.sessionData) {
      this.sessionData.accessToken = accessToken;
      this.sessionData.refreshToken = refreshToken;
      this.sessionData.expiresAt = Date.now() + (expiresIn * 1000);
      this.saveSession();
    }
  }

  clearSession(): void {
    this.sessionData = null;
    try {
      if (fs.existsSync(this.sessionFile)) {
        fs.removeSync(this.sessionFile);
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  isLoggedIn(): boolean {
    return !!(
      this.sessionData?.isLoggedIn &&
      this.sessionData?.accessToken &&
      this.sessionData?.expiresAt &&
      this.sessionData.expiresAt > Date.now()
    );
  }

  getMsisdn(): string | null {
    return this.sessionData?.msisdn || null;
  }

  getAccessToken(): string | null {
    return this.sessionData?.accessToken || null;
  }
}

export default SessionManager;

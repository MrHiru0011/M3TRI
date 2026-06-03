import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from './config';
import { SessionManager } from './session';
import chalk from 'chalk';

export class ApiClient {
  private client: AxiosInstance;
  private session: SessionManager;

  constructor(session: SessionManager) {
    this.session = session;
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'IM3-CLI/1.0.0',
        'X-Client-Version': '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (reqConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const sessionData = this.session.getSession();

        if (sessionData?.accessToken) {
          reqConfig.headers = reqConfig.headers || {};
          reqConfig.headers['Authorization'] = `Bearer ${sessionData.accessToken}`;
        }

        reqConfig.headers = reqConfig.headers || {};
        reqConfig.headers['X-OAuth-Token'] = this.getOAuthToken();

        return reqConfig;
      },
      (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        return response;
      },
      async (error: AxiosError): Promise<any> => {
        if (error.response?.status === 401) {
          console.log(chalk.yellow('Session expired. Refreshing token...'));
          try {
            await this.refreshToken();
            const originalRequest = error.config as InternalAxiosRequestConfig;
            if (originalRequest) {
              const sessionData = this.session.getSession();
              if (sessionData?.accessToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${sessionData.accessToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.log(chalk.red('Failed to refresh token. Please login again.'));
            this.session.clearSession();
            process.exit(1);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getOAuthToken(): string {
    return config.oauth.token;
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(
        `${config.endpoints.myim3api1}/oauth/token`,
        {
          grant_type: config.oauth.grantType,
          client_id: config.oauth.clientId,
          client_secret: config.oauth.clientSecret,
          scope: 'read write',
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.oauth.clientId}:${config.oauth.clientSecret}`).toString('base64')}`,
          },
        }
      );

      if (response.data?.access_token) {
        this.session.updateToken(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in
        );
      }
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, baseUrl?: string): Promise<T> {
    const url = `${baseUrl || config.endpoints.myim3api1}${endpoint}`;
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, baseUrl?: string): Promise<T> {
    const url = `${baseUrl || config.endpoints.myim3api1}${endpoint}`;
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, baseUrl?: string): Promise<T> {
    const url = `${baseUrl || config.endpoints.myim3api1}${endpoint}`;
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(endpoint: string, baseUrl?: string): Promise<T> {
    const url = `${baseUrl || config.endpoints.myim3api1}${endpoint}`;
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export default ApiClient;

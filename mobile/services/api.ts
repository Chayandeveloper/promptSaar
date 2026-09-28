import { Config } from '../constants/Config';
import { getDeviceId } from './storage';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Config.API_URL;
  }

  private async getHeaders(customHeaders: Record<string, string> = {}): Promise<HeadersInit> {
    const deviceId = await getDeviceId();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...customHeaders,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders((options.headers as Record<string, string>) || {});

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data.message ||
          (data.errors ? Object.values(data.errors).flat().join(', ') : 'Network request failed');
        const error = new Error(errorMessage);
        (error as any).data = data;
        (error as any).status = response.status;
        throw error;
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiClient();

import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  walletAddress?: string;
  isAdmin: boolean;
  createdAt: string;
}

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private token: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('rolley_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('rolley_token');
    }
    return this.token;
  }

  setUser(user: User) {
    this.user = user;
    localStorage.setItem('rolley_user', JSON.stringify(user));
  }

  getUser(): User | null {
    if (!this.user) {
      const stored = localStorage.getItem('rolley_user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  async syncWithBackend(privyToken: string): Promise<User> {
    try {
      const response = await apiClient.syncUser(privyToken) as any;
      this.setUser(response.user);
      this.setToken(response.token);
      return response.user;
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const user = await apiClient.getUserProfile(token) as any;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('rolley_token');
    localStorage.removeItem('rolley_user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin || false;
  }
}

export const authService = AuthService.getInstance();

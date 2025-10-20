const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);

// Jars API
export const jarsApi = {
  createJar: (data: {
    title: string;
    description?: string;
    target_amount: number;
    currency?: string;
    is_public?: boolean;
    deadline?: string;
    category?: string;
    image_url?: string;
  }) => api.post('/jars', data),

  getUserJars: () => api.get('/jars'),

  getJarById: (id: string) => api.get(`/jars/${id}`),

  updateJar: (id: string, data: Partial<{
    title: string;
    description?: string;
    target_amount: number;
    currency?: string;
    is_public?: boolean;
    deadline?: string;
    category?: string;
    image_url?: string;
  }>) => api.put(`/jars/${id}`, data),

  deleteJar: (id: string) => api.delete(`/jars/${id}`),

  getPublicJar: (id: string) => api.get(`/jars/public/${id}`),
};

// Payments API
export const paymentsApi = {
  initiateSTKPush: (data: {
    jar_id: string;
    amount: number;
    contributor_name: string;
    phone_number: string;
  }) => api.post('/payments/stk-push', data),

  initiatePesapalPayment: (data: {
    jar_id: string;
    amount: number;
    contributor_name: string;
    customer_email: string;
    customer_first_name?: string;
    customer_last_name?: string;
  }) => api.post('/payments/pesapal', data),

  getPaymentStatus: (transactionId: string) => api.get(`/payments/status/${transactionId}`),
};

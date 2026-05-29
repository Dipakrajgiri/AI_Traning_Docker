import { API_URL } from './config';
import type { 
  User, 
  Inventory, 
  Category, 
  Item, 
  DashboardStats,
  ItemCreate,
  ItemUpdate
} from './types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('inventrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('inventrack_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.detail || errorMessage;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const register = async (email: string, password: string, name?: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(response);
};

export const login = async (email: string, password: string) => {
  // Using URLSearchParams for form-encoded data which is standard for OAuth2 token endpoints (FastAPI default)
  // Assuming the user might be using OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append('username', email); // FastAPI OAuth2 uses 'username'
  formData.append('password', password);
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  return handleResponse(response);
};

export const getMe = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getInventories = async (): Promise<Inventory[]> => {
  const response = await fetch(`${API_URL}/inventories`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createInventory = async (name: string, description?: string): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const updateInventory = async (id: string, name: string, description?: string): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const deleteInventory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    localStorage.removeItem('inventrack_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete' }));
    throw new Error(errorData.detail || 'Failed to delete');
  }
};

export const getInventory = async (id: string): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getCategories = async (invId: string): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createCategory = async (invId: string, name: string, description?: string): Promise<Category> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const updateCategory = async (invId: string, catId: string, name: string, description?: string): Promise<Category> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories/${catId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const deleteCategory = async (invId: string, catId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories/${catId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    localStorage.removeItem('inventrack_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete' }));
    throw new Error(errorData.detail || 'Failed to delete');
  }
};

export const getItems = async (params?: { cat_id?: string; inv_id?: string }): Promise<Item[]> => {
  const url = new URL(`${API_URL}/items`);
  if (params) {
    if (params.cat_id) url.searchParams.append('cat_id', params.cat_id);
    if (params.inv_id) url.searchParams.append('inv_id', params.inv_id);
  }
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createItem = async (data: ItemCreate): Promise<Item> => {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateItem = async (id: string, data: ItemUpdate): Promise<Item> => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    localStorage.removeItem('inventrack_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete' }));
    throw new Error(errorData.detail || 'Failed to delete');
  }
};

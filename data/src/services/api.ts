import { AppDataResponse, Category, DaySchedule, Product, RestaurantSettings } from '../types';

const API_BASE = '/api';

export async function fetchPublicData(): Promise<AppDataResponse> {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) {
    throw new Error('Falha ao carregar cardápio');
  }
  return res.json();
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token: string; username: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciais inválidas');
  }
  return data;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return !!data.valid;
  } catch {
    return false;
  }
}

export async function fetchAdminData(token: string) {
  const res = await fetch(`${API_BASE}/admin/data`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  return res.json();
}

export async function apiCreateProduct(token: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao salvar produto');
  }
  return res.json();
}

export async function apiUpdateProduct(token: string, id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao atualizar produto');
  }
  return res.json();
}

export async function apiDeleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Falha ao excluir produto');
  }
}

export async function apiCreateCategory(token: string, name: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao criar categoria');
  }
  return res.json();
}

export async function apiUpdateCategory(token: string, id: string, data: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar categoria');
  }
  return res.json();
}

export async function apiDeleteCategory(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao excluir categoria');
  }
}

export async function apiUpdateSchedule(token: string, schedule: DaySchedule[]): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/schedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ schedule }),
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar horários');
  }
  return res.json();
}

export async function apiUpdateSettings(token: string, settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar configurações');
  }
  return res.json();
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao alterar senha');
  }
}

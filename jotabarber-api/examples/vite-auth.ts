import axios from 'axios';

// npm install axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
});

export async function login(username: string, password: string) {
  await api.get('/sanctum/csrf-cookie');
  const { data } = await api.post('/api/auth/login', { username, password });
  return data.data; // { user, branches, branch_id }; renderiza branches en tu combo.
}

export async function selectBranch(branch_id: number) {
  await api.post('/api/auth/branch', { branch_id });
  return (await api.get('/api/auth/menu')).data.data;
}

export async function logout() {
  await api.post('/api/auth/logout');
}

export async function createSale(service_id: number, barber_id: number) {
  // Conserva operation_key y el cuerpo si necesitas reintentar.
  const payload = {
    operation_key: crypto.randomUUID(),
    services: [{ service_id, barber_id, quantity: 1, discount_amount: '0.00' }],
  };
  return { payload, result: (await api.post('/api/sales', payload)).data.data };
}

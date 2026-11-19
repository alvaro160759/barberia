import axios from 'src/utils/axios';

const BASE = '/api/inventory';

export const inventoryApi = {
  getMovements: (params) => axios.get(`${BASE}/movements`, { params }),
  adjustStock: (data) => axios.post(`${BASE}/movements`, data),
};

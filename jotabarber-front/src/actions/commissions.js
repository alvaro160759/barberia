import axios from 'src/utils/axios';

const BASE = '/api/commissions';

export const commissionsApi = {
  getPending: (params) => axios.get(`${BASE}/pending`, { params }),
  getAll: (params) => axios.get(BASE, { params }),
  getById: (id) => axios.get(`${BASE}/${id}`),
  pay: (data) => axios.post(BASE, data),
};

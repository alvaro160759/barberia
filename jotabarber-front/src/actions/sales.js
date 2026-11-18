import axios, { endpoints } from 'src/utils/axios';

export const salesApi = {
  getAll: (params) => axios.get(endpoints.sales.root, { params }),
  getById: (id) => axios.get(endpoints.sales.detail(id)),
  create: (data) => axios.post(endpoints.sales.root, data),
  registerPayment: (saleId, data) => axios.post(endpoints.sales.payment(saleId), data),
  getCashSessions: (params) => axios.get(endpoints.cashSessions, { params }),
  getCashSessionById: (id) => axios.get(`${endpoints.cashSessions}/${id}`),
  openCashSession: (data) => axios.post(endpoints.cashSessions, data),
  closeCashSession: (id, data) => axios.post(`${endpoints.cashSessions}/${id}/close`, data),
};

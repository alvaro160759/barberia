import axios, { endpoints } from 'src/utils/axios';

export const expensesApi = {
  getAll: (params) => axios.get(endpoints.expenses, { params }),
  getById: (id) => axios.get(`${endpoints.expenses}/${id}`),
  create: (data) => axios.post(endpoints.expenses, data),
};

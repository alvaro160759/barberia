import axios, { endpoints } from 'src/utils/axios';

export const employeesApi = {
  // Empleados (Barberos)
  getEmployees: (params) => axios.get(endpoints.employees.index, { params }),
  getEmployee: (id) => axios.get(`${endpoints.employees.index}/${id}`),
  createEmployee: (data) => axios.post(endpoints.employees.index, data),
  updateEmployee: (id, data) =>
    data instanceof FormData
      ? axios.post(`${endpoints.employees.index}/${id}`, (() => { data.append('_method', 'PUT'); return data; })())
      : axios.put(`${endpoints.employees.index}/${id}`, data),
  deleteEmployee: (id) => axios.delete(`${endpoints.employees.index}/${id}`),
  assignEmployee: (data) => axios.post(endpoints.employees.assign, data),
  getDirectory: (params) => axios.get(endpoints.employees.directory, { params }),
};

import axios, { endpoints } from 'src/utils/axios';

export const catalogApi = {
  // Productos
  getProducts: (params) => axios.get(endpoints.catalog.products, { params }),
  getProduct: (id) => axios.get(`${endpoints.catalog.products}/${id}`),
  createProduct: (data) => axios.post(endpoints.catalog.products, data),
  updateProduct: (id, data) => axios.put(`${endpoints.catalog.products}/${id}`, data),
  deleteProduct: (id) => axios.delete(`${endpoints.catalog.products}/${id}`),

  // Servicios
  getServices: (params) => axios.get(endpoints.catalog.services, { params }),
  getService: (id) => axios.get(`${endpoints.catalog.services}/${id}`),
  createService: (data) => axios.post(endpoints.catalog.services, data),
  updateService: (id, data) => axios.put(`${endpoints.catalog.services}/${id}`, data),
  deleteService: (id) => axios.delete(`${endpoints.catalog.services}/${id}`),

  // Categorías de Servicios
  getServiceCategories: (params) => axios.get(endpoints.catalog.serviceCategories, { params }),
  getServiceCategory: (id) => axios.get(`${endpoints.catalog.serviceCategories}/${id}`),
  createServiceCategory: (data) => axios.post(endpoints.catalog.serviceCategories, data),
  updateServiceCategory: (id, data) => axios.put(`${endpoints.catalog.serviceCategories}/${id}`, data),
  deleteServiceCategory: (id) => axios.delete(`${endpoints.catalog.serviceCategories}/${id}`),

  // Categorías de Productos
  getProductCategories: (params) => axios.get(endpoints.catalog.productCategories, { params }),
  getProductCategory: (id) => axios.get(`${endpoints.catalog.productCategories}/${id}`),
  createProductCategory: (data) => axios.post(endpoints.catalog.productCategories, data),
  updateProductCategory: (id, data) => axios.put(`${endpoints.catalog.productCategories}/${id}`, data),
  deleteProductCategory: (id) => axios.delete(`${endpoints.catalog.productCategories}/${id}`),

  // Clientes
  getCustomers: (params) => axios.get(endpoints.catalog.customers, { params }),
  getCustomer: (id) => axios.get(`${endpoints.catalog.customers}/${id}`),
  createCustomer: (data) => axios.post(endpoints.catalog.customers, data),
  updateCustomer: (id, data) => axios.put(`${endpoints.catalog.customers}/${id}`, data),
  deleteCustomer: (id) => axios.delete(`${endpoints.catalog.customers}/${id}`),
};

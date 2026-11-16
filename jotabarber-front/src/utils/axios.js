import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
    login: '/api/auth/token',
    branches: '/api/auth/branches',
    selectBranch: '/api/auth/branch',
    menu: '/api/auth/menu',
    logout: '/api/auth/logout',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  appointments: {
    list: '/api/appointments',
    detail: (id) => `/api/appointments/${id}`,
    status: (id) => `/api/appointments/${id}/status`,
  },
  access: {
    branches: '/api/access/branches',
    users: '/api/access/users',
    roles: '/api/access/roles',
    permissions: '/api/access/permissions',
    menus: '/api/access/menus',
  },
  employees: {
    index: '/api/employees',
    directory: '/api/employees/directory',
    assign: '/api/employees/assign',
  },
  catalog: {
    products: '/api/catalog/products',
    services: '/api/catalog/services',
    serviceCategories: '/api/catalog/service-categories',
    productCategories: '/api/catalog/product-categories',
    customers: '/api/catalog/customers',
  },
};

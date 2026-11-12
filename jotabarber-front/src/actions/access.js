import axios, { endpoints } from 'src/utils/axios';

export const accessApi = {
  // Usuarios
  getUsers: (params) => axios.get(endpoints.access.users, { params }),
  getUser: (id) => axios.get(`${endpoints.access.users}/${id}`),
  createUser: (data) => axios.post(endpoints.access.users, data),
  updateUser: (id, data) => axios.put(`${endpoints.access.users}/${id}`, data),
  deleteUser: (id) => axios.delete(`${endpoints.access.users}/${id}`),
  assignUser: (data) => axios.post('/api/access/user-branches', data),

  // Roles
  getRoles: () => axios.get(endpoints.access.roles),
  getRole: (id) => axios.get(`${endpoints.access.roles}/${id}`),
  createRole: (data) => axios.post(endpoints.access.roles, data),
  updateRole: (id, data) => axios.put(`${endpoints.access.roles}/${id}`, data),
  deleteRole: (id) => axios.delete(`${endpoints.access.roles}/${id}`),

  // Permisos
  getPermissions: () => axios.get(endpoints.access.permissions),

  // Menús
  getMenus: () => axios.get(endpoints.access.menus),
  updateMenu: (id, data) => axios.put(`${endpoints.access.menus}/${id}`, data),

  // Sucursales
  getBranches: () => axios.get(endpoints.access.branches),
  getBranch: (id) => axios.get(`${endpoints.access.branches}/${id}`),
  createBranch: (data) => axios.post(endpoints.access.branches, data),
  updateBranch: (id, data) => axios.put(`${endpoints.access.branches}/${id}`, data),
  deleteBranch: (id) => axios.delete(`${endpoints.access.branches}/${id}`),
};

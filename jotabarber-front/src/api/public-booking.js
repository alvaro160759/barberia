import axios from '../utils/axios';

const API_BASE = '/api/public';

export const publicBookingApi = {
  getBranches: async () => {
    const response = await axios.get(`${API_BASE}/branches`);
    return response.data;
  },

  getBarbers: async (branchId) => {
    const response = await axios.get(`${API_BASE}/barbers`, {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  getServices: async (branchId) => {
    const response = await axios.get(`${API_BASE}/services`, {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  getSchedules: async (branchId, barberId, date, serviceIds = []) => {
    const response = await axios.get(`${API_BASE}/schedules`, {
      params: {
        branch_id: branchId,
        barber_id: barberId,
        date,
        service_ids: serviceIds
      }
    });
    return response.data;
  },

  createAppointment: async (data) => {
    const response = await axios.post(`${API_BASE}/appointments`, data);
    return response.data;
  }
};

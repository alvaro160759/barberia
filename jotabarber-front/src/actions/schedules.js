import axios, { endpoints } from 'src/utils/axios';

export const schedulesApi = {
  getBarberSchedules: (params) => axios.get(endpoints.schedules.barber, { params }),
  createBarberSchedule: (data) => axios.post(endpoints.schedules.barber, data),
  deleteBarberSchedule: (id) => axios.delete(`${endpoints.schedules.barber}/${id}`),
  getTimeOff: (params) => axios.get(endpoints.schedules.timeOff, { params }),
  createTimeOff: (data) => axios.post(endpoints.schedules.timeOff, data),
  deleteTimeOff: (id) => axios.delete(`${endpoints.schedules.timeOff}/${id}`),
  getSettings: (employeeId) =>
    axios.get(endpoints.schedules.settings, { params: { employee_id: employeeId } }),
  updateSettings: (data) => axios.put(endpoints.schedules.settings, data),
};

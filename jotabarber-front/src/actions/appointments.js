import axios, { endpoints } from 'src/utils/axios';

export const appointmentsApi = {
  getAppointments: (params) => axios.get(endpoints.appointments.list, { params }),
  getAppointment: (id) => axios.get(endpoints.appointments.detail(id)),
  changeStatus: (id, data) => axios.patch(endpoints.appointments.status(id), data),
};

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No asistió' },
];

export const APPOINTMENT_STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
};

export const APPOINTMENT_ACTIONS = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Confirmar', color: 'primary', variant: 'contained' },
    { status: 'CANCELLED', label: 'Cancelar cita', color: 'error', variant: 'outlined' },
    { status: 'NO_SHOW', label: 'No asistió', color: 'warning', variant: 'outlined' },
  ],
  CONFIRMED: [
    { status: 'IN_PROGRESS', label: 'Atender', color: 'primary', variant: 'contained' },
    { status: 'CANCELLED', label: 'Cancelar cita', color: 'error', variant: 'outlined' },
    { status: 'NO_SHOW', label: 'No asistió', color: 'warning', variant: 'outlined' },
  ],
  IN_PROGRESS: [
    { status: 'COMPLETED', label: 'Completar', color: 'primary', variant: 'contained' },
    { status: 'CANCELLED', label: 'Cancelar cita', color: 'error', variant: 'outlined' },
  ],
};

export const EMPTY_APPOINTMENT_FILTERS = { from: '', to: '', barber_id: '', status: '' };

export function getAppointmentStatusLabel(status) {
  return APPOINTMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

export function formatAppointmentDate(value) {
  const [date, time] = (value || '').split(' ');
  return date ? `${date.split('-').reverse().join('/')} ${time || ''}` : '-';
}

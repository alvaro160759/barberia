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

export const APPOINTMENT_NEXT_ACTION = {
  PENDING: { status: 'CONFIRMED', label: 'Confirmar' },
  CONFIRMED: { status: 'IN_PROGRESS', label: 'Atender' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Completar' },
};

export const EMPTY_APPOINTMENT_FILTERS = { from: '', to: '', barber_id: '', status: '' };

export function getAppointmentStatusLabel(status) {
  return APPOINTMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

export function formatAppointmentDate(value) {
  const [date, time] = (value || '').split(' ');
  return date ? `${date.split('-').reverse().join('/')} ${time || ''}` : '-';
}

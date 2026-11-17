export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentChipColor = 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default';

export interface AppointmentStatusOption {
  value: AppointmentStatus;
  label: string;
}

export interface AppointmentAction {
  status: AppointmentStatus;
  label: string;
  color: 'primary' | 'error' | 'warning';
  variant: 'contained' | 'outlined';
}

export interface AppointmentFilters {
  from: string;
  to: string;
  barber_id: string | number;
  status: string;
}

export interface BranchOption {
  id: number | string;
  name: string;
}

export interface BarberOption {
  id: number;
  first_name: string;
  last_name: string;
  job_type?: string;
  active?: boolean;
}

export interface AppointmentService {
  id: number;
  service_name: string;
  quoted_price: number | string;
  duration_minutes: number | string;
}

export interface AppointmentRow {
  id: number;
  starts_local?: string;
  ends_local?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  barber_first_name?: string;
  barber_last_name?: string;
  status: AppointmentStatus;
}

export interface AppointmentDetail extends AppointmentRow {
  customer_email?: string;
  notes?: string;
  services?: AppointmentService[];
}

export const APPOINTMENT_STATUS_OPTIONS: AppointmentStatusOption[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No asistió' },
];

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, AppointmentChipColor> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
};

export const APPOINTMENT_ACTIONS: Partial<Record<AppointmentStatus, AppointmentAction[]>> = {
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

export const EMPTY_APPOINTMENT_FILTERS: AppointmentFilters = { from: '', to: '', barber_id: '', status: '' };

export function getAppointmentStatusLabel(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

export function formatAppointmentDate(value?: string | null) {
  const [date, time] = (value || '').split(' ');
  return date ? `${date.split('-').reverse().join('/')} ${time || ''}` : '-';
}

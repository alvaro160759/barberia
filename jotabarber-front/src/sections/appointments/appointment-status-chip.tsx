import Chip from '@mui/material/Chip';

import {
  APPOINTMENT_STATUS_COLORS,
  getAppointmentStatusLabel,
} from './appointments-constants';

import type { AppointmentStatus } from './appointments-constants';

interface AppointmentStatusChipProps {
  status: AppointmentStatus;
}

export function AppointmentStatusChip({ status }: AppointmentStatusChipProps) {
  return (
    <Chip
      size="small"
      label={getAppointmentStatusLabel(status)}
      color={APPOINTMENT_STATUS_COLORS[status] || 'default'}
    />
  );
}

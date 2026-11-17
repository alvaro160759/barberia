import Chip from '@mui/material/Chip';

import {
  APPOINTMENT_STATUS_COLORS,
  getAppointmentStatusLabel,
} from './appointments-constants';

export function AppointmentStatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={getAppointmentStatusLabel(status)}
      color={APPOINTMENT_STATUS_COLORS[status] || 'default'}
    />
  );
}

import { Card, Chip, Stack, TextField, Typography, Autocomplete } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { formatAppointmentDate } from 'src/sections/appointments/appointments-constants';

function appointmentLabel(appointment) {
  const customer = `${appointment.customer_first_name ?? ''} ${appointment.customer_last_name ?? ''}`.trim();
  const barber = `${appointment.barber_first_name ?? ''} ${appointment.barber_last_name ?? ''}`.trim();
  return [formatAppointmentDate(appointment.starts_local), customer, barber].filter(Boolean).join(' · ');
}

export function AppointmentPickerCard({ appointments, loading, selectedAppointment, onSelect }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Iconify icon="solar:calendar-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Cita confirmada (opcional)
        </Typography>
        {selectedAppointment && (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`#${selectedAppointment.id}`}
            onDelete={() => onSelect(null)}
          />
        )}
      </Stack>

      <Autocomplete
        size="small"
        options={appointments}
        loading={loading}
        value={selectedAppointment}
        onChange={(event, value) => onSelect(value)}
        getOptionLabel={appointmentLabel}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        noOptionsText="No hay citas confirmadas para hoy"
        renderInput={(params) => (
          <TextField
            {...params}
            label="Seleccionar cita"
            placeholder="Citas confirmadas de hoy"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <Iconify icon="solar:calendar-bold" width={18} sx={{ ml: 1, color: 'text.secondary' }} />
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Al elegir una cita se cargan automáticamente el cliente, el barbero y los servicios.
      </Typography>
    </Card>
  );
}

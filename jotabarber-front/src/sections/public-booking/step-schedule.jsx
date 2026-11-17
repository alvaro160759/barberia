import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

import { Field } from 'src/components/hook-form';

import { SelectableCard } from './selectable-card';

export function ScheduleStep({ schedules, loading }) {
  const { watch, setValue } = useFormContext();
  const selectedTime = watch('stepFour.time');

  return (
    <Box>
      <Field.DatePicker
        name="stepFour.date"
        label="Seleccionar Fecha"
        fullWidth
        minDate={dayjs()}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Horarios Disponibles
          </Typography>

          {schedules.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay horarios disponibles para la fecha seleccionada. Por favor, seleccione otra fecha.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {schedules.map((schedule) => {
                const selected = selectedTime === schedule.time;
                return (
                  <Grid item xs={4} sm={3} md={2} key={schedule.time}>
                    <SelectableCard
                      selected={selected}
                      disabled={!schedule.available}
                      onClick={() => setValue('stepFour.time', schedule.time, { shouldValidate: true })}
                      contentSx={{ display: 'block', textAlign: 'center', px: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                        {schedule.time}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={selected ? 'primary.main' : schedule.available ? 'text.secondary' : 'text.disabled'}
                      >
                        {selected ? 'Seleccionado' : schedule.available ? 'Disponible' : 'Ocupado'}
                      </Typography>
                    </SelectableCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

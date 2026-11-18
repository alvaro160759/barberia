import type { ScheduleSlot, PublicService, BookingFormValues } from 'src/hooks/use-public-booking';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { StepLayout } from './step-layout';
import { SelectableCard } from './selectable-card';

interface ScheduleStepProps {
  schedules: ScheduleSlot[];
  services?: PublicService[];
  loading: boolean;
}

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const VISIBLE_DAYS = 14;

export function ScheduleStep({ schedules, services = [], loading }: ScheduleStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<BookingFormValues>();
  const selectedTime = watch('stepFour.time');
  const selectedDate = watch('stepFour.date');
  const selectedServiceIds = watch('stepThree.service_ids') || [];

  const upcomingDates = useMemo(() => {
    const today = dayjs().startOf('day');
    return Array.from({ length: VISIBLE_DAYS }, (_, index) => today.add(index, 'day'));
  }, []);

  const selectedServices = services.filter((service) =>
    selectedServiceIds.includes(Number(service.id))
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration_minutes), 0);

  return (
    <StepLayout
      title="Selecciona fecha y horario"
      icon="solar:clock-circle-bold-duotone"
      error={errors.stepFour?.date?.message || errors.stepFour?.time?.message}
    >
      {selectedServices.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          {selectedServices.map((service) => (
            <Chip
              key={service.id}
              size="small"
              variant="outlined"
              icon={<Iconify icon="solar:scissors-bold" width={14} />}
              label={`${service.name} · ${service.duration_minutes} min`}
            />
          ))}
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Total: ${totalDuration} min`}
          />
        </Stack>
      )}

      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Seleccionar Fecha
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          mb: 2,
          mx: -0.5,
          px: 0.5,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'divider' },
        }}
      >
        {upcomingDates.map((date, index) => {
          const selected = dayjs(selectedDate).isSame(date, 'day');
          return (
            <Box key={date.format('YYYY-MM-DD')} sx={{ flex: '0 0 auto', width: 68 }}>
              <SelectableCard
                selected={selected}
                onClick={() => setValue('stepFour.date', date.format('YYYY-MM-DD'), { shouldValidate: true })}
                contentSx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1.25, gap: 0 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: selected ? 'primary.main' : 'text.secondary', lineHeight: 1.4 }}
                >
                  {index === 0 ? 'Hoy' : WEEKDAYS_SHORT[date.day()]}
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.1, fontWeight: 700 }}>
                  {date.date()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: selected ? 'primary.main' : 'text.secondary', lineHeight: 1.4 }}
                >
                  {MONTHS_SHORT[date.month()]}
                </Typography>
              </SelectableCard>
            </Box>
          );
        })}
      </Box>

      {selectedDate && !loading && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5 }}>
            Horarios disponibles
          </Typography>

          {schedules.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ py: 3, borderRadius: 1.5, border: (theme: any) => `dashed 1px ${theme.vars.palette.divider}` }}
            >
              <Iconify icon="solar:clock-circle-linear" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No hay horarios disponibles para esta fecha.
                <br />
                Prueba con otro día.
              </Typography>
            </Box>
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

      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      )}
    </StepLayout>
  );
}

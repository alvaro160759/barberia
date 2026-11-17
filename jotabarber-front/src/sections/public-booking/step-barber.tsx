import type { PublicBarber, BookingFormValues } from 'src/hooks/use-public-booking';

import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { StepLayout } from './step-layout';
import { SelectableCard } from './selectable-card';

interface BarberStepProps {
  barbers: PublicBarber[];
  loading: boolean;
}

export function BarberStep({ barbers, loading }: BarberStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<BookingFormValues>();
  const selectedId = watch('stepTwo.barber_id');

  return (
    <StepLayout
      title="Selecciona el barbero"
      icon="solar:user-bold-duotone"
      loading={loading}
      empty={!loading && barbers.length === 0}
      emptyMessage="No hay barberos disponibles en esta sede."
      error={errors.stepTwo?.barber_id?.message}
    >
      <Grid container spacing={1.5}>
        {barbers.map((barber) => {
          const selected = Number(selectedId) === Number(barber.id);
          const initials = `${barber.first_name?.[0] ?? ''}${barber.last_name?.[0] ?? ''}`;
          return (
            <Grid item xs={12} sm={6} key={barber.id}>
              <SelectableCard
                selected={selected}
                onClick={() => setValue('stepTwo.barber_id', Number(barber.id), { shouldValidate: true })}
              >
                <Avatar
                  src={barber.photo_url || barber.avatar_url || undefined}
                  sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', flexShrink: 0 }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {barber.first_name} {barber.last_name}
                  </Typography>
                  <Rating value={barber.rating ?? 5} readOnly size="small" />
                  {barber.phone && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {barber.phone}
                    </Typography>
                  )}
                </Box>
                {selected && (
                  <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'primary.main', flexShrink: 0 }} />
                )}
              </SelectableCard>
            </Grid>
          );
        })}
      </Grid>
    </StepLayout>
  );
}

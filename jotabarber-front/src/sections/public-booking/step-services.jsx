import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useFormContext } from 'react-hook-form';

import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';

import { StepLayout } from './step-layout';
import { SelectableCard } from './selectable-card';

export function ServicesStep({ services, loading }) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const selectedIds = watch('stepThree.service_ids') || [];

  const toggleService = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];
    setValue('stepThree.service_ids', next, { shouldValidate: true });
  };

  const selectedServices = services.filter((service) =>
    selectedIds.includes(Number(service.id))
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration_minutes), 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);

  return (
    <StepLayout
      title="Selecciona los servicios que deseas"
      icon="solar:scissors-bold-duotone"
      loading={loading}
      empty={!loading && services.length === 0}
      emptyMessage="No hay servicios disponibles en esta sede."
      error={errors.stepThree?.service_ids?.message}
    >
      <Grid container spacing={1.5}>
        {services.map((service) => {
          const selected = selectedIds.includes(Number(service.id));
          return (
            <Grid item xs={12} sm={6} key={service.id}>
              <SelectableCard
                selected={selected}
                onClick={() => toggleService(Number(service.id))}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: selected ? 'primary.dark' : 'background.neutral',
                    color: selected ? 'primary.contrastText' : 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="solar:scissors-bold" width={24} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    S/ {service.price} · {service.duration_minutes} min
                  </Typography>
                </Box>
                {selected && (
                  <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'primary.main', flexShrink: 0 }} />
                )}
              </SelectableCard>
            </Grid>
          );
        })}
      </Grid>

      {selectedServices.length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mt: 2,
            pt: 2,
            px: 1,
            borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}
          </Typography>
          <Typography variant="subtitle2">
            S/ {totalPrice.toFixed(2)} · {totalDuration} min
          </Typography>
        </Stack>
      )}
    </StepLayout>
  );
}

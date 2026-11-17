import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useFormContext } from 'react-hook-form';

import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';

import { StepLayout } from './step-layout';
import { SelectableCard } from './selectable-card';

export function ServicesStep({ services, loading }) {
  const { watch, setValue } = useFormContext();
  const selectedIds = watch('stepThree.service_ids') || [];

  const toggleService = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];
    setValue('stepThree.service_ids', next, { shouldValidate: true });
  };

  return (
    <StepLayout
      title="Selecciona los servicios que deseas"
      loading={loading}
      empty={services.length === 0}
      emptyMessage="No hay servicios disponibles en esta sede."
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
    </StepLayout>
  );
}

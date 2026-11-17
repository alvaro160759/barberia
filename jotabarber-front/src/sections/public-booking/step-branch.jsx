import { useFormContext } from 'react-hook-form';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { StepLayout } from './step-layout';
import { SelectableCard } from './selectable-card';

export function BranchStep({ branches, loading }) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const selectedId = watch('stepOne.branch_id');

  return (
    <StepLayout
      title="Selecciona la sede"
      icon="solar:buildings-2-bold-duotone"
      loading={loading}
      empty={!loading && branches.length === 0}
      emptyMessage="No hay sedes disponibles en este momento. Inténtalo más tarde."
      error={errors.stepOne?.branch_id?.message}
    >
      <Grid container spacing={2}>
        {branches.map((branch) => {
          const selected = Number(selectedId) === Number(branch.id);
          return (
            <Grid item xs={12} sm={6} key={branch.id}>
              <SelectableCard
                selected={selected}
                onClick={() => setValue('stepOne.branch_id', Number(branch.id), { shouldValidate: true })}
                contentSx={{ display: 'block' }}
              >
                <Typography variant="subtitle1">{branch.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {branch.address}
                </Typography>
                {branch.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {branch.phone}
                  </Typography>
                )}
              </SelectableCard>
            </Grid>
          );
        })}
      </Grid>
    </StepLayout>
  );
}

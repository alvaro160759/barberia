import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useBranches } from 'src/hooks/use-branches';

export function BranchNewEditForm({ currentBranch, onSuccess }) {
  const { createBranch, updateBranch, loading } = useBranches();

  const [formData, setFormData] = useState({
    code: currentBranch?.code || '',
    name: currentBranch?.name || '',
    address: currentBranch?.address || '',
    phone: currentBranch?.phone || '',
    active: currentBranch?.active ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Al crear, no enviamos 'active' porque el backend no lo espera
      const { active, ...dataToSend } = formData;
      
      if (currentBranch) {
        await updateBranch(currentBranch.id, formData);
      } else {
        await createBranch(dataToSend);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving branch:', error);
      // El error ya es manejado por el hook con toast
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Código"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Activo"
            />
          </Grid>
          <Grid xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={onSuccess}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Guardando...' : currentBranch ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </form>
  );
}

import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useServices } from 'src/hooks/use-services';
import { SplashScreen } from 'src/components/loading-screen';

export function ServiceNewEditForm({ currentService, onSuccess }) {
  const { createService, updateService, loading } = useServices();

  const [formData, setFormData] = useState({
    name: currentService?.name || '',
    code: currentService?.code || '',
    price: currentService?.price || '',
    commission_percentage: currentService?.commission_percentage || 0,
    description: currentService?.description || '',
    active: currentService?.active ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      
      if (currentService) {
        await updateService(currentService.id, dataToSend);
      } else {
        await createService(dataToSend);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Código"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="% Comisión"
              type="number"
              value={formData.commission_percentage}
              onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
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
              <Button type="button" variant="outlined" onClick={onSuccess} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Guardando...' : currentService ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </form>
  );
}

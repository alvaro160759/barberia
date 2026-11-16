import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useEmployees } from 'src/hooks/use-employees';

export function EmployeeNewEditForm({ currentEmployee, onSuccess }) {
  const { createEmployee, updateEmployee, loading } = useEmployees();

  const [formData, setFormData] = useState({
    first_name: currentEmployee?.first_name || '',
    last_name: currentEmployee?.last_name || '',
    job_type: currentEmployee?.job_type || 'BARBER',
    document_type: currentEmployee?.document_type || 'DNI',
    document_number: currentEmployee?.document_number || '',
    phone: currentEmployee?.phone || '',
    email: currentEmployee?.email || '',
    active: currentEmployee?.active ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEmployee) {
        await updateEmployee(currentEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
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
              label="Nombre"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Cargo"
              value={formData.job_type}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              required
            >
              <MenuItem value="BARBER">Barbero</MenuItem>
              <MenuItem value="RECEPTIONIST">Recepcionista</MenuItem>
              <MenuItem value="MANAGER">Gerente</MenuItem>
              <MenuItem value="OTHER">Otro</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Tipo de Documento"
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
            >
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="CARNE_EXTRANJERIA">Carné de Extranjería</MenuItem>
              <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Documento"
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
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
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                {loading ? 'Guardando...' : currentEmployee ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </form>
  );
}

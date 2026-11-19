import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useEmployees } from 'src/hooks/use-employees';
import { useBranches } from 'src/hooks/use-branches';
import { UploadAvatar } from 'src/components/upload';
import { CONFIG } from 'src/config-global';

export function EmployeeNewEditForm({ currentEmployee, onSuccess }) {
  const { createEmployee, updateEmployee, loading } = useEmployees();
  const { branches, fetchBranches } = useBranches();

  const [formData, setFormData] = useState({
    first_name: currentEmployee?.first_name || '',
    last_name: currentEmployee?.last_name || '',
    job_type: currentEmployee?.job_type || 'BARBER',
    document_type: currentEmployee?.document_type || 'DNI',
    document_number: currentEmployee?.document_number || '',
    phone: currentEmployee?.phone || '',
    email: currentEmployee?.email || '',
    branch_id: currentEmployee?.assigned_branch_id || '',
    active: currentEmployee?.active ?? true,
  });
  const [avatar, setAvatar] = useState(
    currentEmployee?.avatar ? `${CONFIG.site.serverUrl}${currentEmployee.avatar}` : null
  );

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = formData;
      if (avatar instanceof File) {
        payload = new FormData();
        Object.entries({ ...formData, active: formData.active ? 1 : 0 }).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) payload.append(key, value);
        });
        payload.append('avatar', avatar);
      }
      if (currentEmployee) {
        await updateEmployee(currentEmployee.id, payload);
      } else {
        await createEmployee(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
      // El error ya es manejado por el hook con toast
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Foto del colaborador
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Esta foto se muestra en el directorio y reportes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center' }}>
                <UploadAvatar
                  sx={{ width: 200, height: 200 }}
                  value={avatar}
                  onDrop={(accepted) => setAvatar(accepted[0])}
                  //visibleByDefault
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                JPG, PNG o WebP · máx. 2MB
              </Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={9}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
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
              label="Sucursal"
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Grid>
          <Grid xs={6}>
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
        </Grid>
      </Grid>
    </form>
  );
}

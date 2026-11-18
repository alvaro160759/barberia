import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useUsers } from 'src/hooks/use-users';
import { useRoles } from 'src/hooks/use-roles';
import { useBranches } from 'src/hooks/use-branches';

import { useSettingsContext } from 'src/components/settings';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export function UserNewEditForm({ currentUser }) {
  const settings = useSettingsContext();
  const router = useRouter();

  const { roles, fetchRoles, loading: loadingRoles } = useRoles();
  const { branches, fetchBranches, loading: loadingBranches } = useBranches();
  const { createUser, updateUser, assignUser } = useUsers();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: null,
    branch_id: null,
    active: true,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRoles(), fetchBranches()]);
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          username: currentUser.username || '',
          email: currentUser.email || '',
          password: '',
          role_id: currentUser.role_ids?.[0] || null,
          branch_id: currentUser.branch_id || null,
          active: currentUser.active ?? true,
        });
      } else {
        // Por defecto, establecer la sucursal seleccionada
        const selectedBranchId = localStorage.getItem('selectedBranchId');
        if (selectedBranchId) {
          setFormData((prev) => ({ ...prev, branch_id: parseInt(selectedBranchId, 10) }));
        }
      }
      setLoading(false);
    };
    loadData();
  }, [currentUser, fetchRoles, fetchBranches]);

  // Si los hooks están cargando, mostrar SplashScreen
  const isLoading = loading || loadingRoles || loadingBranches;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let response;
      // Convertir role_id a role_ids array para el backend
      const dataToSend = {
        ...formData,
        role_ids: formData.role_id ? [formData.role_id] : [],
      };
      // No enviar branch_id al crear/update (el backend usa la sucursal del contexto)
      delete dataToSend.branch_id;

      if (currentUser) {
        response = await updateUser(currentUser.id, dataToSend);
        // Si la sucursal cambió, reasignar
        if (currentUser.branch_id !== formData.branch_id && formData.branch_id) {
          await assignUser({
            user_id: currentUser.id,
            role_ids: dataToSend.role_ids,
            active: true,
          });
        }
      } else {
        response = await createUser(dataToSend);
        // Asignar a la sucursal seleccionada
        if (formData.branch_id && response.data?.data?.id) {
          await assignUser({
            user_id: response.data.data.id,
            role_ids: dataToSend.role_ids,
            active: true,
          });
        }
      }

      // Verificar si la respuesta tiene success: true
      if (response?.success) {
        // Redirig ir a la lista de usuarios
        router.push(paths.dashboard.maintenance.users.root);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // El error ya es manejado por el hook con toast
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={settings.themeStretch ? false : 3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >

              <Stack spacing={1}>
                <Typography variant="subtitle2">Nombre completo</Typography>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Usuario</Typography>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={!!currentUser}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Email</Typography>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  Contraseña {currentUser ? '(dejar vacío para mantener)' : ''}
                </Typography>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!currentUser}
                  minLength={12}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Rol</InputLabel>
                  <Select
                    value={formData.role_id || ''}
                    size="small"
                    label="Seleccionar Rol"
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    required
                  >
                    {Array.isArray(roles) && roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Sucursal</InputLabel>
                  <Select
                    value={formData.branch_id || ''}
                    size="small"
                    label="Seleccionar Sucursal"
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    required
                  >
                    {Array.isArray(branches) && branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="h6" sx={{ gridColumn: '1 / -1' }}>
                Estado
              </Typography>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleChange}
                      name="active"
                    />
                  }
                  label="Usuario activo"
                />
              </Box>
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 2}}>
              <Stack spacing={2} sx={{ width: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {currentUser ? 'Actualizar' : 'Crear'} Usuario
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
}

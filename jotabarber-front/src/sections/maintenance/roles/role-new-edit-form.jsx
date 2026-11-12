import { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useRoles } from 'src/hooks/use-roles';
import { usePermissions } from 'src/hooks/use-permissions';

import { useSettingsContext } from 'src/components/settings';
import { SplashScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

export function RoleNewEditForm({ currentRole }) {
  const settings = useSettingsContext();
  const router = useRouter();

  const { createRole, updateRole, loading: loadingRoles } = useRoles();
  const { permissions, fetchPermissions, loading: loadingPermissions } = usePermissions();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    permission_ids: [],
  });

  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('0');

  useEffect(() => {
    const loadData = async () => {
      await fetchPermissions();
      if (currentRole) {
        setFormData({
          code: currentRole.code || '',
          name: currentRole.name || '',
          description: currentRole.description || '',
          permission_ids: currentRole.permission_ids || [],
        });
      }
      setLoading(false);
    };
    loadData();
  }, [currentRole, fetchPermissions]);

  // Agrupar permisos por módulo cuando cambian
  useEffect(() => {
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});
    setPermissionsByModule(grouped);
  }, [permissions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter((id) => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }));
  };

  const handleSelectAllModule = (modulePermissions) => {
    const allSelected = modulePermissions.every((perm) =>
      formData.permission_ids.includes(perm.id)
    );

    if (allSelected) {
      // Deseleccionar todos del módulo
      setFormData((prev) => ({
        ...prev,
        permission_ids: prev.permission_ids.filter(
          (id) => !modulePermissions.some((perm) => perm.id === id)
        ),
      }));
    } else {
      // Seleccionar todos del módulo
      const moduleIds = modulePermissions.map((perm) => perm.id);
      setFormData((prev) => ({
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...moduleIds])],
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (currentRole) {
        await updateRole(currentRole.id, formData);
      } else {
        await createRole(formData);
      }
      router.push(paths.dashboard.maintenance.roles.root);
    } catch (error) {
      console.error('Error saving role:', error);
      // El error ya es manejado por el hook con toast
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || loadingRoles || loadingPermissions;

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
              <Typography variant="h6" sx={{ gridColumn: '1 / -1' }}>
                Información del Rol
              </Typography>

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Código</Typography>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={!!currentRole}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Nombre</Typography>
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

              <Stack spacing={1.5} sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2">Descripción</Typography>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Typography variant="h6" sx={{ gridColumn: '1 / -1', mt: 2 }}>
                Permisos
              </Typography>

              {Object.keys(permissionsByModule).length > 0 ? (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {Object.keys(permissionsByModule).map((module, index) => (
                          <Tab key={module} label={module} value={index.toString()} />
                        ))}
                      </TabList>
                    </Box>
                    {Object.entries(permissionsByModule).map(([module, modulePermissions], index) => (
                      <TabPanel key={module} value={index.toString()}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={modulePermissions.every((perm) =>
                                formData.permission_ids.includes(perm.id)
                              )}
                              onChange={() => handleSelectAllModule(modulePermissions)}
                            />
                          }
                          label="Seleccionar todos"
                        />
                        <Box
                          sx={{
                            pl: 3,
                            mt: 1,
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: 1,
                          }}
                        >
                          {modulePermissions.map((perm) => (
                            <FormControlLabel
                              key={perm.id}
                              control={
                                <Switch
                                  checked={formData.permission_ids.includes(perm.id)}
                                  onChange={() => handlePermissionChange(perm.id)}
                                />
                              }
                              label={perm.name}
                              sx={{ display: 'block', mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </TabPanel>
                    ))}
                  </TabContext>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ gridColumn: '1 / -1', color: 'text.secondary' }}>
                  No hay permisos disponibles
                </Typography>
              )}
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Stack spacing={2} sx={{ width: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {currentRole ? 'Actualizar' : 'Crear'} Rol
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
}

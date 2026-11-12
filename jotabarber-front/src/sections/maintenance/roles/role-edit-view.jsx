import { useState, useEffect } from 'react';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { SplashScreen } from 'src/components/loading-screen';

import { useRoles } from 'src/hooks/use-roles';

import { RoleNewEditForm } from './role-new-edit-form';

// ----------------------------------------------------------------------

export function RoleEditView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const { fetchRole, loading } = useRoles();
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const role = await fetchRole(id);
        setCurrentRole(role);
      } catch (error) {
        console.error('Error fetching role:', error);
      }
    };
    if (id) loadRole();
  }, [id, fetchRole]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar rol"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Roles', href: paths.dashboard.maintenance.roles.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleNewEditForm currentRole={currentRole} />
    </Container>
  );
}

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeNewEditForm } from './employee-new-edit-form';

export function EmployeeCreateView() {
  const settings = useSettingsContext();
  const router = useRouter();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nuevo colaborador"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Colaboradores', href: paths.dashboard.maintenance.employees.root },
          { name: 'Nuevo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <EmployeeNewEditForm onSuccess={() => router.push(paths.dashboard.maintenance.employees.root)} />
    </Container>
  );
}

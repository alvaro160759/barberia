import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BranchNewEditForm } from './branch-new-edit-form';

export function BranchCreateView() {
  const settings = useSettingsContext();
  const router = useRouter();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nueva Sede"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Sedes', href: paths.dashboard.maintenance.branches.root },
          { name: 'Nueva' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <BranchNewEditForm onSuccess={() => router.push(paths.dashboard.maintenance.branches.root)} />
    </Container>
  );
}

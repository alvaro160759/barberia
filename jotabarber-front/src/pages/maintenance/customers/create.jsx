import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomerNewEditForm } from 'src/sections/maintenance/customers/customer-new-edit-form';

export default function Page() {
  const settings = useSettingsContext();
  const router = useRouter();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nuevo Cliente"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Clientes', href: paths.dashboard.maintenance.customers.root },
          { name: 'Nuevo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <CustomerNewEditForm onSuccess={() => router.push(paths.dashboard.maintenance.customers.root)} />
    </Container>
  );
}

import { useState, useEffect } from 'react';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams , useRouter } from 'src/routes/hooks';

import { useServices } from 'src/hooks/use-services';

import { useSettingsContext } from 'src/components/settings';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ServiceNewEditForm } from './service-new-edit-form';

export function ServiceEditView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { id } = useParams();
  const { fetchService, loading } = useServices();
  const [currentService, setCurrentService] = useState(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        const service = await fetchService(id);
        setCurrentService(service);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };
    if (id) loadService();
  }, [id, fetchService]);

  const handleSuccess = () => {
    router.push(paths.dashboard.maintenance.services.root);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Servicio"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Servicios', href: paths.dashboard.maintenance.services.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {loading ? <SplashScreen /> : <ServiceNewEditForm currentService={currentService} onSuccess={handleSuccess} />}
    </Container>
  );
}

import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { SplashScreen } from 'src/components/loading-screen';
import { employeesApi } from 'src/actions/employees';
import { EmployeeNewEditForm } from './employee-new-edit-form';

export function EmployeeEditView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await employeesApi.getEmployee(id);
        setCurrentEmployee(response.data?.data || response.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployee();
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Barbero"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Barberos', href: paths.dashboard.maintenance.employees.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {loading ? <SplashScreen /> : <EmployeeNewEditForm currentEmployee={currentEmployee} onSuccess={() => window.history.back()} />}
    </Container>
  );
}

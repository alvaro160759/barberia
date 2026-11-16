import { useState, useEffect } from 'react';

import { Grid, Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useServices } from 'src/hooks/use-services';
import { useEmployees } from 'src/hooks/use-employees';
import { useCustomers } from 'src/hooks/use-customers';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SummaryCard } from './components/summary-card';
import { ClientSelectionCard } from './components/client-selection-card';
import { BarberSelectionCard } from './components/barber-selection-card';
import { ServiceSelectionCard } from './components/service-selection-card';

export function ServiceRegistrationView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { services, fetchServices } = useServices();
  const { employees, fetchEmployees } = useEmployees();
  const { customers, fetchCustomers } = useCustomers();

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [addedServices, setAddedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchServices(), fetchEmployees(), fetchCustomers()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [fetchServices, fetchEmployees, fetchCustomers]);

  const handleRegisterService = () => {
    console.log('Registrando servicio:', {
      client: selectedClient,
      barber: selectedBarber,
      services: addedServices,
      paymentMethod,
      notes
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Registro de Servicios"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Servicios', href: paths.dashboard.maintenance.services.root },
          { name: 'Registrar servicio' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <ClientSelectionCard
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            clientSearch={clientSearch}
            setClientSearch={setClientSearch}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarberSelectionCard
            employees={employees}
            selectedBarber={selectedBarber}
            setSelectedBarber={setSelectedBarber}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ServiceSelectionCard
            services={services}
            addedServices={addedServices}
            setAddedServices={setAddedServices}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            serviceSearch={serviceSearch}
            setServiceSearch={setServiceSearch}
            fetchServices={fetchServices}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SummaryCard
            addedServices={addedServices}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            notes={notes}
            setNotes={setNotes}
            onRegisterService={handleRegisterService}
            onCancel={handleCancel}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

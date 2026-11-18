import { useState, useEffect, useCallback } from 'react';
import { Helmet } from "react-helmet-async";

import { CONFIG } from "src/config-global";
import { useParams } from "react-router";
import { useRouter } from "src/routes/hooks";
import { useCustomers } from "src/hooks/use-customers";
import { CustomerNewEditForm } from "src/sections/maintenance/customers/customer-new-edit-form";
import { SplashScreen } from "src/components/loading-screen";
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Button, Container } from '@mui/material';
import { paths } from 'src/routes/paths';

const metadata = { title: `Editar Cliente - ${CONFIG.site.name}` };

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchCustomer, loading } = useCustomers();
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const loadCustomer = useCallback(async () => {
    try {
      const customer = await fetchCustomer(id);
      setCurrentCustomer(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }, [id, fetchCustomer]);

  useEffect(() => {
    if (id) loadCustomer();
  }, [id, loadCustomer]);

  return (
    <Container maxWidth={false}>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      
      <CustomBreadcrumbs
        heading="Clientes"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Clientes' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.maintenance.customers.new)}
          >
            Nuevo Cliente
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? <SplashScreen /> : <CustomerNewEditForm currentCustomer={currentCustomer} onSuccess={loadCustomer} />}
    </Container>
  );
}

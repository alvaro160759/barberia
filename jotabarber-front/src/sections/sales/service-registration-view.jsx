import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Chip, Grid, Stack, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useServices } from 'src/hooks/use-services';
import { useProducts } from 'src/hooks/use-products';
import { useEmployees } from 'src/hooks/use-employees';
import { useCustomers } from 'src/hooks/use-customers';

import { salesApi } from 'src/actions/sales';
import { catalogApi } from 'src/actions/catalog';
import { employeesApi } from 'src/actions/employees';
import { appointmentsApi } from 'src/actions/appointments';

import { toast } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ClientSelectionCard } from './components/client-selection-card';
import { BarberSelectionCard } from './components/barber-selection-card';
import { ServiceSelectionCard } from './components/service-selection-card';
import { AppointmentPickerCard } from './components/appointment-picker-card';

export function ServiceRegistrationView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const appointmentParam = searchParams.get('appointment');
  const autoLoadedRef = useRef(false);
  const { services, loading: servicesLoading, fetchServices } = useServices();
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { employees, loading: employeesLoading, fetchEmployees } = useEmployees();
  const { customers, fetchCustomers, createCustomer } = useCustomers();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [openCashSession, setOpenCashSession] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addedItems, setAddedItems] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [methodsRes, cashRes] = await Promise.all([
          catalogApi.getPaymentMethods({ per_page: 100 }),
          salesApi.getCashSessions({ per_page: 100 }),
          fetchServices(),
          fetchProducts(),
          fetchEmployees(),
          fetchCustomers(),
        ]);
        const methodsData = methodsRes?.data?.data?.data || methodsRes?.data?.data || methodsRes?.data || [];
        setPaymentMethods(Array.isArray(methodsData) ? methodsData : []);
        const sessionsData = cashRes?.data?.data?.data || cashRes?.data?.data || cashRes?.data || [];
        const sessions = Array.isArray(sessionsData) ? sessionsData : [];
        setOpenCashSession(sessions.find((s) => s.status === 'OPEN') || null);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await appointmentsApi.getAppointments({
          from: today,
          to: today,
          per_page: 100,
        });
        const data = response.data?.data?.data || response.data?.data || [];
        const appointments = Array.isArray(data) ? data : [];
        setConfirmedAppointments(
          appointments.filter((appt) => ['PENDING', 'CONFIRMED'].includes(appt.status))
        );
      } catch (error) {
        console.error('Error loading confirmed appointments:', error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadData();
    loadAppointments();
  }, [fetchServices, fetchProducts, fetchEmployees, fetchCustomers]);

  const getItemPrice = (item) => (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
  const getEmployeeName = (employee) =>
    [employee?.first_name, employee?.last_name].filter((name) => typeof name === 'string' && name).join(' ') || 'Barbero seleccionado';
  const getClientName = (client) =>
    [client?.first_name, client?.last_name].filter((name) => typeof name === 'string' && name).join(' ') || client?.full_name || 'Cliente';

  const handleSelectAppointment = useCallback(async (appointment) => {
    setSelectedAppointment(appointment);
    if (!appointment) return;

    try {
      const response = await appointmentsApi.getAppointment(appointment.id);
      const detail = response.data?.data || response.data;
      if (!detail) return;

      setSelectedClient({
        id: detail.customer_id,
        first_name: detail.customer_first_name || '',
        last_name: detail.customer_last_name || '',
        phone: detail.customer_phone || null,
        email: detail.customer_email || null,
      });

      let barber = employees.find((emp) => Number(emp.id) === Number(detail.barber_id));
      if (!barber && detail.barber_id) {
        try {
          const empRes = await employeesApi.getEmployee(detail.barber_id);
          barber = empRes?.data?.data || empRes?.data || null;
        } catch (err) {
          console.error('Error loading appointment barber:', err);
        }
      }
      setSelectedBarber(
        barber ||
          (detail.barber_id
            ? {
                id: detail.barber_id,
                first_name: detail.barber_first_name || '',
                last_name: detail.barber_last_name || '',
                job_type: 'BARBER',
              }
            : null)
      );
      setNotes(detail.notes || '');

      const items = (detail.services || []).map((service) => {
        const catalogService = services.find((svc) => Number(svc.id) === Number(service.service_id));
        return {
          ...(catalogService || {
            id: service.service_id,
            name: service.service_name,
            price: service.quoted_price,
          }),
          itemType: 'service',
          quantity: 1,
        };
      });
      setAddedItems(items);

      const selectedMatch = confirmedAppointments.find((appt) => Number(appt.id) === Number(appointment.id));
      setSelectedAppointment({ ...appointment, ...selectedMatch, ...(detail || {}) });
    } catch (error) {
      console.error('Error loading appointment detail:', error);
      toast.error('No se pudo cargar el detalle de la cita');
    }
  }, [confirmedAppointments, employees, services]);

  useEffect(() => {
    if (!appointmentParam || autoLoadedRef.current) return;
    if (appointmentsLoading || employeesLoading || servicesLoading) return;

    const match = confirmedAppointments.find(
      (appt) => Number(appt.id) === Number(appointmentParam)
    );
    autoLoadedRef.current = true;
    handleSelectAppointment(match || { id: Number(appointmentParam) });
  }, [
    appointmentParam,
    confirmedAppointments,
    appointmentsLoading,
    employeesLoading,
    servicesLoading,
    handleSelectAppointment,
  ]);

  const buildSalePayload = async () => {
    // Resolver customer_id: si el cliente no tiene id (viene de apiperu), buscarlo por documento en la lista local
    let customerId = selectedClient?.id ?? null;
    if (selectedClient && !customerId && selectedClient.document_number) {
      // Buscar si ya existe en la lista local de clientes por documento
      const existingLocal = customers.find(
        (c) => c.document_number === selectedClient.document_number
      );
      if (existingLocal) {
        customerId = existingLocal.id;
      } else {
        // No existe localmente, crearlo
        const response = await createCustomer({
          document_type: selectedClient.document_type || 'DNI',
          document_number: selectedClient.document_number || null,
          first_name: selectedClient.first_name || selectedClient.full_name?.split(' ')[0] || 'Cliente',
          last_name: selectedClient.last_name || selectedClient.full_name?.split(' ').slice(1).join(' ') || null,
          phone: selectedClient.phone || null,
          email: selectedClient.email || null,
        });
        const created = response?.data?.data || response?.data || response;
        customerId = created?.id ?? null;
      }
    }

    // Calcular descuento total (misma lógica que la tabla)
    const subtotal = addedItems.reduce((sum, s) => sum + getItemPrice(s) * (s.quantity || 1), 0);
    const discountPercentValue = typeof discountPercent === 'number' ? discountPercent : parseFloat(discountPercent) || 0;
    const discountAmountValue = typeof discountAmount === 'number' ? discountAmount : parseFloat(discountAmount) || 0;
    const finalDiscount = Math.min(Math.max(subtotal * (discountPercentValue / 100), discountAmountValue), subtotal);

    // Repartir el descuento proporcionalmente entre las líneas (en centavos)
    const lines = addedItems.map((item) => ({
      item,
      qty: item.quantity || 1,
      priceCents: Math.round(getItemPrice(item) * 100),
    }));
    const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);
    const discountCents = Math.min(Math.round(finalDiscount * 100), subtotalCents);
    let allocatedCents = 0;

    const serviceLines = [];
    const productLines = [];
    lines.forEach((line, index) => {
      const lineCents = line.priceCents * line.qty;
      let lineDiscountCents;
      if (index === lines.length - 1) {
        lineDiscountCents = discountCents - allocatedCents;
      } else {
        lineDiscountCents = subtotalCents > 0 ? Math.floor((discountCents * lineCents) / subtotalCents) : 0;
        allocatedCents += lineDiscountCents;
      }
      const lineDiscountAmount = (lineDiscountCents / 100).toFixed(2);
      if (line.item.itemType === 'product') {
        productLines.push({ product_id: line.item.id, quantity: line.qty, discount_amount: lineDiscountAmount });
      } else {
        serviceLines.push({ service_id: line.item.id, barber_id: selectedBarber.id, quantity: line.qty, discount_amount: lineDiscountAmount });
      }
    });

    return {
      operation_key: crypto.randomUUID(),
      customer_id: customerId,
      appointment_id: selectedAppointment ? Number(selectedAppointment.id) : null,
      notes: notes || null,
      services: serviceLines,
      products: productLines,
    };
  };

  const handleRegisterService = async () => {
    if (addedItems.length === 0) {
      toast.warning('Agrega al menos un servicio o producto');
      return;
    }
    const hasServices = addedItems.some((i) => i.itemType !== 'product');
    if (hasServices && !selectedBarber?.id) {
      toast.warning('Selecciona un barbero para los servicios');
      return;
    }
    const paymentMethodRow = paymentMethods.find((m) => (m.code || '').toUpperCase() === (paymentMethod || '').toUpperCase());
    if (!paymentMethodRow?.id) {
      toast.error('No se encontró el método de pago seleccionado');
      return;
    }
    if (paymentMethodRow.code === 'CASH' && !openCashSession?.id) {
      toast.error('No hay una caja de efectivo abierta. Ábrela antes de cobrar en efectivo.');
      return;
    }

    setRegistering(true);
    try {
      const payload = await buildSalePayload();
      const saleResponse = await salesApi.create(payload);
      const sale = saleResponse?.data?.data || saleResponse?.data;
      const saleId = sale?.id;
      if (!saleId) {
        toast.error('No se pudo registrar la venta');
        return;
      }

      await salesApi.registerPayment(saleId, {
        operation_key: crypto.randomUUID(),
        payment_method_id: paymentMethodRow.id,
        cash_session_id: paymentMethodRow.code === 'CASH' ? openCashSession?.id ?? null : null,
        amount: Number(sale.total_amount ?? 0).toFixed(2),
      });

      toast.success(`Venta registrada correctamente (Total: S/ ${Number(sale.total_amount ?? 0).toFixed(2)})`);

      // Reset del formulario
      setAddedItems([]);
      setSelectedItem(null);
      setSelectedClient(null);
      setSelectedBarber(null);
      setSelectedAppointment(null);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setNotes('');
    } catch (err) {
      toast.error(err?.message || 'Error al registrar la venta');
    } finally {
      setRegistering(false);
    }
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
        sx={{ mb: { xs: 3, md: 3 } }}
      />

      {selectedAppointment && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'primary.light',
            bgcolor: 'primary.lighter',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                Atendiendo cita #{selectedAppointment.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Cliente: {getClientName(selectedClient)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" color="primary" label={`Barbero: ${getEmployeeName(selectedBarber)}`} />
              {selectedAppointment.starts_local && (
                <Chip size="small" variant="outlined" label={selectedAppointment.starts_local.slice(11, 16)} />
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: { xs: 3, md: 5 } }}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <AppointmentPickerCard
              appointments={confirmedAppointments}
              loading={appointmentsLoading}
              selectedAppointment={selectedAppointment}
              onSelect={handleSelectAppointment}
            />
            <ClientSelectionCard
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              clientSearch={clientSearch}
              setClientSearch={setClientSearch}
            />
            <BarberSelectionCard
              employees={employees}
              loading={employeesLoading}
              selectedBarber={selectedBarber}
              setSelectedBarber={setSelectedBarber}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          <ServiceSelectionCard
            services={services}
            servicesLoading={servicesLoading}
            fetchServices={fetchServices}
            products={products}
            productsLoading={productsLoading}
            fetchProducts={fetchProducts}
            addedItems={addedItems}
            setAddedItems={setAddedItems}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            onRegisterService={handleRegisterService}
            onCancel={handleCancel}
            registering={registering}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

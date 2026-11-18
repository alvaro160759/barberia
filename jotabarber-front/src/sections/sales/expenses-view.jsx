import { useState, useEffect, useCallback } from 'react';

import { Container, Stack, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Alert, Box, Grid, CardActionArea, Autocomplete } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { expensesApi } from 'src/actions/expenses';
import { catalogApi } from 'src/actions/catalog';
import { salesApi } from 'src/actions/sales';
import { useBranches } from 'src/hooks/use-branches';
import { SplashScreen } from 'src/components/loading-screen';

export function ExpensesView() {
  const settings = useSettingsContext();
  const { branches, fetchBranches } = useBranches();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [cashSessions, setCashSessions] = useState([]);

  // Filtros
  const today = new Date().toISOString().split('T')[0];
  const [filterFromDate, setFilterFromDate] = useState(today);
  const [filterToDate, setFilterToDate] = useState(today);
  const [filterBranch, setFilterBranch] = useState(null);

  // KPIs
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);

  // Cargar sedes al montar
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    description: '',
    amount: '',
    payment_method_id: '',
    cash_session_id: '',
    reference: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (filterFromDate) params.from = filterFromDate;
      if (filterToDate) params.to = filterToDate;
      if (filterBranch?.id) params.branch_id = filterBranch.id;

      const [expensesRes, categoriesRes, methodsRes, sessionsRes] = await Promise.all([
        expensesApi.getAll(params),
        catalogApi.getExpenseCategories({ active: true, per_page: 100 }),
        catalogApi.getPaymentMethods({ active: true, per_page: 100 }),
        salesApi.getCashSessions({ status: 'OPEN', per_page: 1 }),
      ]);

      const expensesData = expensesRes?.data?.data?.data || expensesRes?.data?.data || expensesRes?.data || [];
      const expensesArray = Array.isArray(expensesData) ? expensesData : [];
      setExpenses(expensesArray);

      // Calcular KPIs
      const total = expensesArray.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      setTotalExpenses(total);

      const today = new Date().toISOString().split('T')[0];
      const todayTotal = expensesArray
        .filter((e) => e.spent_at && e.spent_at.startsWith(today))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      setTodayExpenses(todayTotal);

      const categoriesData = categoriesRes?.data?.data?.data || categoriesRes?.data?.data || categoriesRes?.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const methodsData = methodsRes?.data?.data?.data || methodsRes?.data?.data || methodsRes?.data || [];
      setPaymentMethods(Array.isArray(methodsData) ? methodsData : []);

      const sessionsData = sessionsRes?.data?.data?.data || sessionsRes?.data?.data || sessionsRes?.data || [];
      setCashSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [filterFromDate, filterToDate, filterBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

  const handleOpenModal = () => {
    setFormData({
      category_id: '',
      description: '',
      amount: '',
      payment_method_id: '',
      cash_session_id: '',
      reference: '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.category_id) {
      toast.warning('Selecciona una categoría');
      return;
    }
    if (!formData.description) {
      toast.warning('Ingresa una descripción');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.warning('Ingresa un monto válido');
      return;
    }
    if (!formData.payment_method_id) {
      toast.warning('Selecciona un método de pago');
      return;
    }

    setActionLoading(true);
    try {
      const selectedMethod = paymentMethods.find((m) => m.id === parseInt(formData.payment_method_id, 10));
      const isCash = selectedMethod?.code === 'CASH';

      const payload = {
        operation_key: crypto.randomUUID(),
        category_id: parseInt(formData.category_id, 10),
        description: formData.description,
        amount: parseFloat(formData.amount).toFixed(2),
        payment_method_id: parseInt(formData.payment_method_id, 10),
        cash_session_id: isCash && formData.cash_session_id ? parseInt(formData.cash_session_id, 10) : null,
        reference: formData.reference || null,
      };

      await expensesApi.create(payload);
      toast.success('Egreso registrado correctamente');
      setOpenModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating expense:', error);
      const errorData = error?.response?.data || error;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(errorData?.message || 'Error al registrar el egreso');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Gestión de Egresos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Ventas', href: paths.dashboard.sales.root },
          { name: 'Gestión de Egresos' },
        ]}
        action={
          <Button variant="contained"  onClick={handleOpenModal} startIcon={<Iconify icon="mingcute:add-line" />}>
            Nuevo Egreso
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>Total Egresos</Typography>
            <Typography variant="h4">{formatCurrency(totalExpenses)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>Egresos Hoy</Typography>
            <Typography variant="h4">{formatCurrency(todayExpenses)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Registros</Typography>
            <Typography variant="h4">{expenses.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Categorías</Typography>
            <Typography variant="h4">{categories.length}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
          <Stack spacing={2} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Desde"
                type="date"
                size="small"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Hasta"
                type="date"
                size="small"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={branches}
                getOptionLabel={(option) => option.name || ''}
                value={filterBranch}
                onChange={(e, newValue) => setFilterBranch(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Sucursal" size="small" />
                )}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button variant="outlined" onClick={() => { setFilterFromDate(''); setFilterToDate(''); setFilterBranch(null); }}>
            Limpiar Filtros
          </Button>
        </Stack>
      </Card>

      <Card>
        <Stack>

          {loading ? (
            <SplashScreen />
          ) : expenses.length === 0 ? (
            <Typography>No hay egresos registrados</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Método de Pago</TableCell>
                  <TableCell>Referencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => {
                  const category = categories.find((c) => c.id === expense.category_id);
                  const method = paymentMethods.find((m) => m.id === expense.payment_method_id);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.id}</TableCell>
                      <TableCell>{expense.spent_at ? new Date(expense.spent_at).toLocaleString() : '-'}</TableCell>
                      <TableCell>{category?.name || expense.category_id || '-'}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{method?.name || expense.payment_method_id || '-'}</TableCell>
                      <TableCell>{expense.reference || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Card>

      {/* Modal Registrar Egreso */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Egreso</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Categoría"
              value={formData.category_id}
              onChange={handleInputChange('category_id')}
              required
              fullWidth
            >
              <MenuItem value="">Selecciona una categoría</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Descripción"
              value={formData.description}
              onChange={handleInputChange('description')}
              required
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              required
              fullWidth
              inputProps={{ min: '0.01', step: '0.01' }}
              InputProps={{
                startAdornment: 'S/ ',
              }}
            />

            <TextField
              select
              label="Método de Pago"
              value={formData.payment_method_id}
              onChange={handleInputChange('payment_method_id')}
              required
              fullWidth
            >
              <MenuItem value="">Selecciona un método</MenuItem>
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </TextField>

            {paymentMethods.find((m) => m.id === parseInt(formData.payment_method_id, 10))?.code === 'CASH' && (
              <TextField
                select
                label="Sesión de Caja"
                value={formData.cash_session_id}
                onChange={handleInputChange('cash_session_id')}
                fullWidth
              >
                <MenuItem value="">Sin sesión de caja</MenuItem>
                {cashSessions.map((session) => (
                  <MenuItem key={session.id} value={session.id}>
                    Sesión #{session.id} - {new Date(session.opened_at).toLocaleString()}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Referencia (opcional)"
              value={formData.reference}
              onChange={handleInputChange('reference')}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

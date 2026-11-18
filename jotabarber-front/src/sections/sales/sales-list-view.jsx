import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { Table, TableRow, TableCell, Button, Dialog, DialogTitle, DialogContent, DialogActions, TableBody, TableContainer, Typography, Box, Stack, Divider, IconButton, Skeleton, Grid, TextField, MenuItem } from '@mui/material';
import { Autocomplete } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useBranches } from 'src/hooks/use-branches';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { salesApi } from 'src/actions/sales';
import { appointmentsApi } from 'src/actions/appointments';

const TABLE_HEAD = [
  { id: 'number', label: 'Número' },
  { id: 'sold_at', label: 'Fecha' },
  { id: 'customer', label: 'Cliente' },
  { id: 'items', label: 'Items', align: 'center' },
  { id: 'total_amount', label: 'Total', align: 'right' },
  { id: 'status', label: 'Estado', align: 'center' },
  { id: 'acciones', label: 'Acciones', align: 'right', width: 100 },
];

const STATUS_LABELS = {
  CONFIRMED: 'Confirmada',
  DRAFT: 'Borrador',
  CANCELLED: 'Anulada',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
};

const formatMoney = (value) => `S/ ${Number(value ?? 0).toFixed(2)}`;

const getCustomerName = (row) => {
  const name = [row.customer_first_name, row.customer_last_name].filter((n) => typeof n === 'string' && n).join(' ');
  return name || (row.customer_document ? `Doc: ${row.customer_document}` : 'Cliente general');
};

// ----------------------------------------------------------------------

export function SalesListView() {
  const router = useRouter();
  const { branches, fetchBranches } = useBranches();
  const table = useTable();
  const detailDialog = useBoolean();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Filtros
  const today = new Date().toISOString().split('T')[0];
  const [filterFromDate, setFilterFromDate] = useState(today);
  const [filterToDate, setFilterToDate] = useState(today);
  const [filterBranch, setFilterBranch] = useState(null);

  // KPIs
  const [totalSales, setTotalSales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);

  // Cargar sedes al montar
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (filterFromDate) params.from = filterFromDate;
      if (filterToDate) params.to = filterToDate;
      if (filterBranch?.id) params.branch_id = filterBranch.id;

      const response = await salesApi.getAll(params);
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setSales(items);

      // Calcular KPIs
      const total = items.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      setTotalSales(total);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayTotal = items
        .filter((s) => s.sold_at && s.sold_at.startsWith(todayStr))
        .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      setTodaySales(todayTotal);
    } catch (err) {
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  }, [filterFromDate, filterToDate, filterBranch]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const fetchConfirmedAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await appointmentsApi.getAppointments({
        status: 'CONFIRMED',
        from: todayStr,
        to: todayStr,
        per_page: 100,
      });
      const data = response?.data?.data?.data || response?.data?.data || [];
      setConfirmedAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading confirmed appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfirmedAppointments();
  }, [fetchConfirmedAppointments]);

  const handleViewDetail = async (row) => {
    setSelectedSale(row);
    setSaleDetail(null);
    detailDialog.onTrue();
    setDetailLoading(true);
    try {
      const response = await salesApi.getById(row.id);
      setSaleDetail(response?.data?.data || response?.data || null);
    } catch (err) {
      console.error('Error loading sale detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const dataFiltered = sales;
  const notFound = !dataFiltered.length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Gestión de servicios"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Gestión', href: '#' },
          { name: 'Gestión de servicios' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.sales.serviceRegistration)}
          >
            Registrar servicio
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>Total Ventas</Typography>
            <Typography variant="h4">{formatMoney(totalSales)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>Ventas Hoy</Typography>
            <Typography variant="h4">{formatMoney(todaySales)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Registros</Typography>
            <Typography variant="h4">{sales.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Promedio por venta</Typography>
            <Typography variant="h4">{sales.length > 0 ? formatMoney(totalSales / sales.length) : formatMoney(0)}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Citas confirmadas por atender */}
      <Card sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, pt: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Citas por atender hoy
          </Typography>
          <Chip
            size="small"
            color="info"
            variant="outlined"
            label={`${confirmedAppointments.length} pendiente${confirmedAppointments.length === 1 ? '' : 's'}`}
          />
        </Stack>
        {appointmentsLoading ? (
          <Stack spacing={1} sx={{ p: 3 }}>
            {[...Array(2)].map((_, i) => <Skeleton key={i} variant="rounded" height={44} />)}
          </Stack>
        ) : confirmedAppointments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2.5 }}>
            No hay citas confirmadas para hoy.
          </Typography>
        ) : (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 640 }}>
                <TableBody>
                  {confirmedAppointments.map((appt) => (
                    <TableRow key={appt.id} hover>
                      <TableCell sx={{ width: 90 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {appt.starts_local?.split(' ')[1] || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appt.starts_local?.split(' ')[0]?.split('-').reverse().join('/')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {appt.customer_first_name} {appt.customer_last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appt.customer_phone || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appt.barber_first_name} {appt.barber_last_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Iconify icon="mingcute:scissors-line" />}
                          onClick={() => router.push(`${paths.dashboard.sales.serviceRegistration}?appointment=${appt.id}`)}
                        >
                          Atender
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}
      </Card>

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
          <Button variant="outlined" onClick={() => { setFilterFromDate(today); setFilterToDate(today); setFilterBranch(null); }}>
            Limpiar Filtros
          </Button>
        </Stack>
      </Card>

      {loading ? (
        <SplashScreen />
      ) : (
        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={sales.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleViewDetail(row)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.number || `#${row.id}`}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(row.sold_at)}</TableCell>
                        <TableCell>{getCustomerName(row)}</TableCell>
                        <TableCell align="center">
                          {(Number(row.services_count) || 0) + (Number(row.products_count) || 0)}
                        </TableCell>
                        <TableCell align="right" fontWeight={600}>
                          {formatMoney(row.total_amount)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={STATUS_LABELS[row.status] || row.status}
                            color={row.status === 'CONFIRMED' ? 'success' : row.status === 'CANCELLED' ? 'error' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewDetail(row); }}>
                            <Iconify icon="mingcute:eye-line" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                  <TableEmptyRows
                    height={56}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <Dialog open={detailDialog.value} onClose={detailDialog.onFalse} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de venta {selectedSale?.number ? `- ${selectedSale.number}` : ''}</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Stack spacing={1}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={36} />)}
            </Stack>
          ) : saleDetail ? (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                <Typography variant="body2">{formatDate(saleDetail.sold_at)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Cliente</Typography>
                <Typography variant="body2">{getCustomerName(saleDetail)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Estado</Typography>
                <Chip size="small" label={STATUS_LABELS[saleDetail.status] || saleDetail.status} color={saleDetail.status === 'CONFIRMED' ? 'success' : 'default'} variant="outlined" />
              </Stack>

              <Divider />

              {[...(saleDetail.services || []), ...(saleDetail.products || [])].length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Items</Typography>
                  <Stack spacing={0.5}>
                    {(saleDetail.services || []).map((s) => (
                      <Stack key={`s-${s.id}`} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{s.service_name} × {s.quantity}</Typography>
                        <Typography variant="body2">{formatMoney(s.net_amount)}</Typography>
                      </Stack>
                    ))}
                    {(saleDetail.products || []).map((p) => (
                      <Stack key={`p-${p.id}`} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{p.product_name} × {p.quantity}</Typography>
                        <Typography variant="body2">{formatMoney(p.net_amount)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              {(saleDetail.payments || []).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Pagos</Typography>
                  <Stack spacing={0.5}>
                    {saleDetail.payments.map((p) => (
                      <Stack key={p.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">Pago #{p.id}</Typography>
                        <Typography variant="body2">{formatMoney(p.amount)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Subtotal</Typography>
                <Typography variant="body2">{formatMoney(saleDetail.subtotal_amount)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Descuento</Typography>
                <Typography variant="body2">{formatMoney(saleDetail.discount_amount)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">{formatMoney(saleDetail.total_amount)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No se pudo cargar el detalle.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={detailDialog.onFalse}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

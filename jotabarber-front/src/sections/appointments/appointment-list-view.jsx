import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import TableCell from '@mui/material/TableCell';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import DialogActions from '@mui/material/DialogActions';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';
import { appointmentsApi } from 'src/actions/appointments';
import { employeesApi } from 'src/actions/employees';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TablePaginationCustom,
} from 'src/components/table';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No asistió' },
];

const STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
};

const NEXT_ACTION = {
  PENDING: { status: 'CONFIRMED', label: 'Confirmar' },
  CONFIRMED: { status: 'IN_PROGRESS', label: 'Atender' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Completar' },
};

const EMPTY_FILTERS = { from: '', to: '', barber_id: '', status: '' };

// ----------------------------------------------------------------------

export function AppointmentListView() {
  const table = useTable();
  const [rows, setRows] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(async (params = appliedFilters) => {
    setLoading(true);
    try {
      const query = { per_page: 100 };
      if (params.from) query.from = params.from;
      if (params.to) query.to = params.to;
      if (params.barber_id) query.barber_id = params.barber_id;
      if (params.status) query.status = params.status;

      const response = await appointmentsApi.getAppointments(query);
      const data = response.data?.data?.data || response.data?.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await axios.get(endpoints.auth.branches);
        const list = response.data?.data || [];
        const branchesList = Array.isArray(list) ? list : [];
        setBranches(branchesList);
        const saved = localStorage.getItem('jota_branch_id');
        if (saved && branchesList.some((b) => String(b.id) === saved)) {
          setSelectedBranch(saved);
          axios.post(endpoints.auth.selectBranch, { branch_id: Number(saved) }).catch(() => {});
        }
      } catch (error) {
        console.error('Error fetching user branches:', error);
      }
    };
    loadBranches();
  }, []);

  const handleBranchChange = async (event) => {
    const branchId = event.target.value;
    setSelectedBranch(branchId);
    localStorage.setItem('jota_branch_id', branchId);
    try {
      await axios.post(endpoints.auth.selectBranch, { branch_id: Number(branchId) });
      await fetchAppointments();
    } catch (error) {
      console.error('Error selecting branch:', error);
    }
  };

  useEffect(() => {
    const loadBarbers = async () => {
      try {
        const response = await employeesApi.getDirectory({ per_page: 100 });
        const data = response.data?.data?.data || response.data?.data || [];
        const list = Array.isArray(data) ? data : [];
        setBarbers(list.filter((e) => e.job_type === 'BARBER' && e.active));
      } catch (error) {
        console.error('Error fetching barbers:', error);
      }
    };
    loadBarbers();
  }, []);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const handleOpenDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await appointmentsApi.getAppointment(id);
      setDetail(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetail(null);
  };

  const handleNextStatus = async () => {
    const action = detail ? NEXT_ACTION[detail.status] : null;
    if (!action) return;
    setActionLoading(true);
    try {
      await appointmentsApi.changeStatus(detail.id, { status: action.status });
      await fetchAppointments();
      const response = await appointmentsApi.getAppointment(detail.id);
      setDetail(response.data?.data || response.data);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const notFound = !rows.length;

  const formatDate = (value) => {
    const [date, time] = (value || '').split(' ');
    return date ? `${date.split('-').reverse().join('/')} ${time || ''}` : '-';
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Gestión de Citas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Gestión de Citas' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading && rows.length === 0 ? (
        <SplashScreen />
      ) : (
        <Card>
          <Stack
            spacing={2}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ p: 2.5, flexWrap: 'wrap' }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sede</InputLabel>
              <TextField
                select
                label="Sede"
                value={selectedBranch}
                onChange={handleBranchChange}
              >
                <MenuItem value="" disabled>
                  Sede actual
                </MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={filters.from}
              onChange={handleFilterChange('from')}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={filters.to}
              onChange={handleFilterChange('to')}
              inputProps={{ min: filters.from || undefined }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Barbero</InputLabel>
              <TextField
                select
                label="Barbero"
                value={filters.barber_id}
                onChange={handleFilterChange('barber_id')}
              >
                <MenuItem value="">Todos</MenuItem>
                {barbers.map((barber) => (
                  <MenuItem key={barber.id} value={barber.id}>
                    {barber.first_name} {barber.last_name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <TextField
                select
                label="Estado"
                value={filters.status}
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">Todos</MenuItem>
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleApplyFilters} startIcon={<Iconify icon="mingcute:search-line" />}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpiar
              </Button>
            </Stack>
          </Stack>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Barbero</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{formatDate(row.starts_local).split(' ')[0]}</TableCell>
                      <TableCell>{row.starts_local?.split(' ')[1]} – {row.ends_local}</TableCell>
                      <TableCell>
                        {row.customer_first_name} {row.customer_last_name}
                      </TableCell>
                      <TableCell>{row.customer_phone || '-'}</TableCell>
                      <TableCell>
                        {row.barber_first_name} {row.barber_last_name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={STATUS_OPTIONS.find((o) => o.value === row.status)?.label || row.status}
                          color={STATUS_COLORS[row.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDetail(row.id)}>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePaginationCustom
            count={rows.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de la Cita</DialogTitle>
        <DialogContent dividers>
          {detailLoading || !detail ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack>
                  <strong>{detail.customer_first_name} {detail.customer_last_name}</strong>
                  <span>{detail.customer_phone || '-'}</span>
                </Stack>
                <Chip
                  size="small"
                  label={STATUS_OPTIONS.find((o) => o.value === detail.status)?.label || detail.status}
                  color={STATUS_COLORS[detail.status] || 'default'}
                />
              </Stack>

              <Stack spacing={0.5}>
                <span><strong>Barbero:</strong> {detail.barber_first_name} {detail.barber_last_name}</span>
                <span><strong>Fecha:</strong> {formatDate(detail.starts_local)}</span>
                <span><strong>Horario:</strong> {detail.starts_local?.split(' ')[1]} – {detail.ends_local}</span>
                {detail.notes && <span><strong>Notas:</strong> {detail.notes}</span>}
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Servicio</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Duración</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detail.services || []).map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.service_name}</TableCell>
                      <TableCell align="right">S/ {service.quoted_price}</TableCell>
                      <TableCell align="right">{service.duration_minutes} min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
          {detail && NEXT_ACTION[detail.status] && (
            <Button
              variant="contained"
              disabled={actionLoading}
              onClick={handleNextStatus}
            >
              {NEXT_ACTION[detail.status].label}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

import { useState, useEffect, useCallback } from 'react';

import { Container, Stack, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Alert, Divider, Box } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { salesApi } from 'src/actions/sales';
import { catalogApi } from 'src/actions/catalog';
import { SplashScreen } from 'src/components/loading-screen';

export function CashHistoryView() {
  const settings = useSettingsContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [openSession, setOpenSession] = useState(null);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState('');
  const [openingAmount, setOpeningAmount] = useState('0');
  const [countedAmount, setCountedAmount] = useState('0');
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const [sessionsRes, registersRes, openRes] = await Promise.all([
          salesApi.getCashSessions({ per_page: 100 }),
          catalogApi.getCashRegisters({ per_page: 100 }),
          salesApi.getCashSessions({ status: 'OPEN', per_page: 1 }),
        ]);

        const sessionsData = sessionsRes?.data?.data?.data || sessionsRes?.data?.data || sessionsRes?.data || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        const registersData = registersRes?.data?.data?.data || registersRes?.data?.data || registersRes?.data || [];
        setCashRegisters(Array.isArray(registersData) ? registersData : []);

        const openData = openRes?.data?.data?.data || openRes?.data?.data || openRes?.data || [];
        const openSessions = (Array.isArray(openData) ? openData : []).filter((s) => s.status === 'OPEN');
        setOpenSession(openSessions[0] || null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

  const handleViewDetails = async (sessionId) => {
    setDetailsLoading(true);
    setDetailsOpen(true);
    try {
      const res = await salesApi.getCashSessionById(sessionId);
      const detail = res?.data?.data || res?.data;
      setDetailsSession(detail);
    } catch (error) {
      console.error('Error loading session details:', error);
      toast.error('Error al cargar el detalle de la sesión');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const buildMovements = (session) => {
    if (!session) return [];
    const movements = [];

    (session.payments || []).forEach((p) => {
      movements.push({
        id: `payment-${p.id}`,
        date: p.paid_at,
        type: 'INGRESO',
        description: `Venta #${p.sale_id}${p.reference ? ` - ${p.reference}` : ''}`,
        amount: Number(p.amount || 0) + Number(p.tip_amount || 0),
      });
    });

    (session.expenses || []).forEach((e) => {
      movements.push({
        id: `expense-${e.id}`,
        date: e.spent_at,
        type: 'EGRESO',
        description: e.description || 'Gasto',
        amount: -Number(e.amount || 0),
      });
    });

    (session.settlements || []).forEach((s) => {
      movements.push({
        id: `settlement-${s.id}`,
        date: s.paid_at,
        type: 'EGRESO',
        description: `Comisión barbero #${s.barber_id} (${s.period_start} a ${s.period_end})`,
        amount: -Number(s.amount || 0),
      });
    });

    return movements.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  };

  const handleOpenModal = () => {
    setSelectedRegister('');
    setOpeningAmount('0');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCountedAmount('0');
    if (openSession) {
      salesApi.getCashSessionById(openSession.id).then((res) => {
        const detail = res?.data?.data || res?.data;
        setExpectedAmount(detail?.current_expected_amount || 0);
      }).catch(console.error);
    }
    setCloseModal(true);
  };

  const handleOpenCash = async () => {
    if (!selectedRegister) {
      toast.warning('Selecciona una caja');
      return;
    }
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      toast.warning('Ingresa un monto válido');
      return;
    }

    setActionLoading(true);
    try {
      await salesApi.openCashSession({
        cash_register_id: parseInt(selectedRegister, 10),
        opening_amount: parseFloat(openingAmount).toFixed(2),
      });
      toast.success('Caja abierta correctamente');
      setOpenModal(false);
      await loadData();
    } catch (error) {
      console.error('Error opening cash session:', error);
      toast.error(error?.response?.data?.message || 'Error al abrir la caja');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!openSession) {
      toast.warning('No hay una sesión de caja abierta');
      return;
    }
    if (!countedAmount || parseFloat(countedAmount) < 0) {
      toast.warning('Ingresa un monto válido');
      return;
    }

    setActionLoading(true);
    try {
      await salesApi.closeCashSession(openSession.id, {
        counted_amount: parseFloat(countedAmount).toFixed(2),
      });
      toast.success('Caja cerrada correctamente');
      setCloseModal(false);
      await loadData();
    } catch (error) {
      console.error('Error closing cash session:', error);
      toast.error(error?.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setActionLoading(false);
    }
  };

  const difference = parseFloat(countedAmount || 0) - parseFloat(expectedAmount || 0);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Gestión de Caja"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Ventas', href: paths.dashboard.sales.root },
          { name: 'Gestión de Caja' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            {!openSession && (
              <Button variant="contained" color="success" onClick={handleOpenModal}>
                Abrir Caja
              </Button>
            )}
            {openSession && (
              <Button variant="contained" color="error" onClick={handleCloseModal}>
                Cerrar Caja
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {openSession && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Sesión de caja abierta desde: <strong>{new Date(openSession.opened_at).toLocaleString()}</strong>
          </Typography>
        </Alert>
      )}

      <Card>
        <Stack>

          {loading ? (
            <SplashScreen />
          ) : sessions.length === 0 ? (
            <Typography>No hay sesiones de caja registradas</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha Apertura</TableCell>
                  <TableCell>Fecha Cierre</TableCell>
                  <TableCell>Monto Apertura</TableCell>
                  <TableCell>Monto Esperado</TableCell>
                  <TableCell>Monto Contado</TableCell>
                  <TableCell>Diferencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.id}</TableCell>
                    <TableCell>{new Date(session.opened_at).toLocaleString()}</TableCell>
                    <TableCell>{session.closed_at ? new Date(session.closed_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>{formatCurrency(session.opening_amount)}</TableCell>
                    <TableCell>{formatCurrency(session.expected_amount)}</TableCell>
                    <TableCell>{formatCurrency(session.counted_amount)}</TableCell>
                    <TableCell>
                      {session.difference_amount !== null ? (
                        <Chip 
                          label={formatCurrency(session.difference_amount)} 
                          size="small"
                          color={session.difference_amount > 0 ? 'error' : session.difference_amount < 0 ? 'warning' : 'success'}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={session.status} 
                        size="small" 
                        color={getStatusColor(session.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewDetails(session.id)}>
                        <Iconify icon="mdi:eye" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Card>

      {/* Modal Abrir Caja */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Abrir Caja</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Caja"
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              required
              fullWidth
            >
              <MenuItem value="">Selecciona una caja</MenuItem>
              {cashRegisters.map((register) => (
                <MenuItem key={register.id} value={register.id}>
                  {register.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Monto de apertura"
              type="number"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              required
              fullWidth
              inputProps={{ min: '0', step: '0.01' }}
              InputProps={{
                startAdornment: 'S/ ',
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button
            onClick={handleOpenCash}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Abrir Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cerrar Caja */}
      <Dialog open={closeModal} onClose={() => setCloseModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cerrar Caja</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {openSession && (
              <Alert severity="info">
                Sesión abierta desde: {new Date(openSession.opened_at).toLocaleString()}
              </Alert>
            )}

            <Typography variant="body1">
              Monto esperado: <strong>{formatCurrency(expectedAmount)}</strong>
            </Typography>

            <TextField
              label="Monto contado"
              type="number"
              value={countedAmount}
              onChange={(e) => setCountedAmount(e.target.value)}
              required
              fullWidth
              inputProps={{ min: '0', step: '0.01' }}
              InputProps={{
                startAdornment: 'S/ ',
              }}
            />

            {countedAmount && (
              <Alert severity={difference === 0 ? 'success' : difference > 0 ? 'info' : 'warning'}>
                {difference === 0 
                  ? 'Caja cuadrada' 
                  : difference > 0 
                  ? `Sobrante: ${formatCurrency(difference)}`
                  : `Faltante: ${formatCurrency(Math.abs(difference))}`}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseModal(false)}>Cancelar</Button>
          <Button
            onClick={handleCloseCash}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Detalle de Sesión */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de Sesión #{detailsSession?.id}</DialogTitle>
        <DialogContent>
          {detailsLoading || !detailsSession ? (
            <Typography sx={{ py: 4, textAlign: 'center' }}>Cargando...</Typography>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" color="text.secondary">Apertura</Typography>
                  <Typography variant="body2">{new Date(detailsSession.opened_at).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Cierre</Typography>
                  <Typography variant="body2">
                    {detailsSession.closed_at ? new Date(detailsSession.closed_at).toLocaleString() : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Estado</Typography>
                  <Chip label={detailsSession.status} size="small" color={getStatusColor(detailsSession.status)} />
                </Box>
              </Stack>

              <Divider />

              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="body2">Monto apertura: <strong>{formatCurrency(detailsSession.opening_amount)}</strong></Typography>
                <Typography variant="body2">Esperado: <strong>{formatCurrency(detailsSession.current_expected_amount ?? detailsSession.expected_amount)}</strong></Typography>
                <Typography variant="body2">Contado: <strong>{formatCurrency(detailsSession.counted_amount)}</strong></Typography>
                <Typography variant="body2">
                  Diferencia: <strong>{formatCurrency(detailsSession.difference_amount)}</strong>
                </Typography>
              </Stack>

              <Divider />

              <Typography variant="subtitle2">Movimientos</Typography>
              {(() => {
                const movements = buildMovements(detailsSession);
                if (movements.length === 0) {
                  return <Typography variant="body2" color="text.secondary">Sin movimientos en esta sesión</Typography>;
                }
                return (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Monto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movements.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.date ? new Date(m.date).toLocaleString() : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={m.type}
                              size="small"
                              color={m.type === 'INGRESO' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{m.description}</TableCell>
                          <TableCell align="right" sx={{ color: m.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                            {formatCurrency(Math.abs(m.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

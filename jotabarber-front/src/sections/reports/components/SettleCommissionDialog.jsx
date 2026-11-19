import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';

import { commissionsApi } from 'src/actions/commissions';
import { catalogApi } from 'src/actions/catalog';
import { salesApi } from 'src/actions/sales';

const formatMoney = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
const todayStr = () => new Date().toISOString().split('T')[0];
const toLocalDate = (iso) => {
  const s = String(iso);
  const d = s.includes('T') ? new Date(s) : new Date(`${s.replace(' ', 'T')}Z`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function SettleCommissionDialog({ open, onClose, barber, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [cashSessions, setCashSessions] = useState([]);
  const [form, setForm] = useState({
    payment_method_id: '',
    cash_session_id: '',
    reference: '',
    notes: '',
  });

  const loadPending = useCallback(async () => {
    if (!barber) return;
    setLoading(true);
    try {
      const res = await commissionsApi.getPending({ barber_id: barber.barber_id, per_page: 500 });
      const data = res?.data?.data?.data || res?.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cargando servicios pendientes');
    } finally {
      setLoading(false);
    }
  }, [barber]);

  const loadCatalogs = useCallback(async () => {
    try {
      const [methodsRes, sessionsRes] = await Promise.all([
        catalogApi.getPaymentMethods({ active: true, per_page: 100 }),
        salesApi.getCashSessions({ status: 'OPEN', per_page: 10 }),
      ]);
      const methods = methodsRes?.data?.data?.data || methodsRes?.data?.data || methodsRes?.data || [];
      const sessions = sessionsRes?.data?.data?.data || sessionsRes?.data?.data || sessionsRes?.data || [];
      setPaymentMethods(Array.isArray(methods) ? methods : []);
      setCashSessions(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  }, []);

  useEffect(() => {
    if (open && barber) {
      setSelected({});
      setForm({
        payment_method_id: '',
        cash_session_id: '',
        reference: '',
        notes: '',
      });
      loadPending();
      loadCatalogs();
    }
  }, [open, barber, loadPending, loadCatalogs]);

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const selectedItems = items.filter((i) => selected[i.id]);
  const selectedTotal = selectedItems.reduce((sum, i) => sum + Number(i.barber_amount || 0), 0);

  // Rango de fechas de los servicios seleccionados (se envía al backend, no se muestra)
  const selectedDates = selectedItems
    .map((i) => (i.sold_at ? toLocalDate(i.sold_at) : null))
    .filter(Boolean)
    .sort();
  const periodStart = selectedDates[0] || todayStr();
  const periodEnd = selectedDates[selectedDates.length - 1] || todayStr();

  const allSelected = items.length > 0 && items.every((i) => selected[i.id]);

  const toggleAll = () => {
    const next = {};
    if (!allSelected) items.forEach((i) => { next[i.id] = true; });
    setSelected(next);
  };

  const isCash = paymentMethods.find((m) => m.id === parseInt(form.payment_method_id, 10))?.code === 'CASH';

  const handlePay = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un servicio');
      return;
    }
    if (!form.payment_method_id) {
      toast.error('Selecciona un método de pago');
      return;
    }
    if (isCash && !form.cash_session_id) {
      toast.error('Selecciona la caja abierta para pago en efectivo');
      return;
    }
    setPaying(true);
    try {
      await commissionsApi.pay({
        operation_key: crypto.randomUUID(),
        barber_id: parseInt(barber.barber_id, 10),
        period_start: periodStart,
        period_end: periodEnd,
        sale_service_ids: selectedIds.map((id) => parseInt(id, 10)),
        payment_method_id: parseInt(form.payment_method_id, 10),
        cash_session_id: form.cash_session_id ? parseInt(form.cash_session_id, 10) : null,
        reference: form.reference || null,
        notes: form.notes || null,
      });
      toast.success('Comisión liquidada y egreso registrado');
      onPaid?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al liquidar comisión');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Liquidar comisión — {barber?.first_name} {barber?.last_name}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No hay servicios pendientes de liquidar para este barbero.
          </Typography>
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Scrollbar>
              <TableContainer>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox checked={allSelected} indeterminate={selectedIds.length > 0 && !allSelected} onChange={toggleAll} />
                      </TableCell>
                      <TableCell>Servicio</TableCell>
                      <TableCell>Venta</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">% Barbero</TableCell>
                      <TableCell align="right">Comisión</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={!!selected[item.id]}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.service_name || `Servicio #${item.service_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} x {formatMoney(item.unit_price)}
                          </Typography>
                        </TableCell>
                        <TableCell>#{item.number || item.sale_id}</TableCell>
                        <TableCell>{item.sold_at ? toLocalDate(item.sold_at).split('-').reverse().join('/') : '-'}</TableCell>
                        <TableCell align="right">{Number(item.barber_percentage || 0)}%</TableCell>
                        <TableCell align="right" fontWeight={600}>
                          {formatMoney(item.barber_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle2">Total a pagar:</Typography>
              <Chip label={formatMoney(selectedTotal)} color="warning" variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                {selectedIds.length} servicio{selectedIds.length === 1 ? '' : 's'} seleccionado{selectedIds.length === 1 ? '' : 's'}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Método de pago"
                size="small"
                value={form.payment_method_id}
                onChange={(e) => setForm((f) => ({ ...f, payment_method_id: e.target.value, cash_session_id: '' }))}
                sx={{ flex: 1 }}
              >
                {paymentMethods.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </TextField>
              {isCash && (
                <TextField
                  select
                  label="Caja abierta"
                  size="small"
                  value={form.cash_session_id}
                  onChange={(e) => setForm((f) => ({ ...f, cash_session_id: e.target.value }))}
                  sx={{ flex: 1 }}
                >
                  {cashSessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      Caja #{s.id} — {s.opening_amount != null ? formatMoney(s.opening_amount) : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>

            <TextField
              label="Referencia (opcional)"
              size="small"
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
            />
            <TextField
              label="Notas (opcional)"
              size="small"
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={paying}>Cancelar</Button>
        {items.length > 0 && (
          <Button
            variant="contained"
            color="warning"
            onClick={handlePay}
            disabled={paying || selectedIds.length === 0}
          >
            {paying ? 'Liquidando...' : `Pagar ${formatMoney(selectedTotal)}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

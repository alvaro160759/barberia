import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

import { inventoryApi } from 'src/actions/inventory';

const TYPE_LABELS = {
  OPENING: 'Apertura',
  PURCHASE: 'Compra',
  CONSUMPTION: 'Consumo',
  SALE: 'Venta',
  ADJUSTMENT_IN: 'Ajuste +',
  ADJUSTMENT_OUT: 'Ajuste -',
};

const formatMoney = (v) => `S/ ${Number(v || 0).toFixed(2)}`;
const formatDate = (iso) => (iso ? String(iso).slice(0, 16).replace('T', ' ') : '-');

export function InventoryMovementsDialog({ open, onClose, products }) {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({ type: '', product_id: '', q: '', from: '', to: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 200 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await inventoryApi.getMovements(params);
      const data = res?.data?.data?.data || res?.data?.data || [];
      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cargando movimientos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const isPositive = (m) => Number(m.quantity_delta) >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Movimientos de inventario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Tipo"
              size="small"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Producto"
              size="small"
              value={filters.product_id}
              onChange={(e) => setFilters((f) => ({ ...f, product_id: e.target.value }))}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {(products || []).map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Buscar"
              size="small"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Producto, SKU o motivo..."
              sx={{ flex: 1 }}
            />
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : movements.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No hay movimientos registrados.
            </Typography>
          ) : (
            <Scrollbar sx={{ maxHeight: 420 }}>
              <TableContainer>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Costo unit.</TableCell>
                      <TableCell>Registrado por</TableCell>
                      <TableCell>Motivo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(m.occurred_at)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{m.product_name}</Typography>
                          {m.product_sku && (
                            <Typography variant="caption" color="text.secondary">{m.product_sku}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={TYPE_LABELS[m.type] || m.type}
                            color={isPositive(m) ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" fontWeight={700} sx={{ color: isPositive(m) ? 'success.dark' : 'error.dark' }}>
                          {isPositive(m) ? '+' : ''}{Number(m.quantity_delta)}
                        </TableCell>
                        <TableCell align="right">{formatMoney(m.unit_cost)}</TableCell>
                        <TableCell>{m.user_name || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
                            {m.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';

import { inventoryApi } from 'src/actions/inventory';

export function StockEntryDialog({ open, onClose, product, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'PURCHASE',
    quantity: '',
    unit_cost: '',
    reason: '',
  });

  const isPositive = ['OPENING', 'PURCHASE', 'ADJUSTMENT_IN'].includes(form.type);

  const handleClose = () => {
    if (saving) return;
    setForm({ type: 'PURCHASE', quantity: '', unit_cost: '', reason: '' });
    onClose();
  };

  const handleSave = async () => {
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }
    if (!form.reason.trim()) {
      toast.error('Ingresa el motivo del ingreso');
      return;
    }
    if (isPositive && (!form.unit_cost || Number(form.unit_cost) <= 0)) {
      toast.error('Ingresa el costo unitario');
      return;
    }
    setSaving(true);
    try {
      await inventoryApi.adjustStock({
        operation_key: crypto.randomUUID(),
        product_id: product.id,
        type: form.type,
        quantity: String(qty),
        unit_cost: isPositive ? String(form.unit_cost) : undefined,
        reason: form.reason.trim(),
      });
      toast.success('Stock actualizado correctamente');
      onSaved?.();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al registrar el ingreso');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Ingreso de stock — {product?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Stock actual: {product?.stock ?? 0} · Se registrará en tu sede actual
          </Typography>

          <TextField
            select
            label="Tipo de movimiento"
            size="small"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <MenuItem value="PURCHASE">Compra / Ingreso</MenuItem>
            <MenuItem value="ADJUSTMENT_IN">Ajuste positivo</MenuItem>
            <MenuItem value="ADJUSTMENT_OUT">Ajuste negativo (salida)</MenuItem>
          </TextField>

          <TextField
            label={isPositive ? 'Cantidad a ingresar' : 'Cantidad a retirar'}
            type="number"
            size="small"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            inputProps={{ min: 0, step: 'any' }}
          />

          {isPositive && (
            <TextField
              label="Costo unitario (S/)"
              type="number"
              size="small"
              value={form.unit_cost}
              onChange={(e) => setForm((f) => ({ ...f, unit_cost: e.target.value }))}
              inputProps={{ min: 0, step: 'any' }}
            />
          )}

          <TextField
            label="Motivo"
            size="small"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder={isPositive ? 'Ej: Compra a proveedor' : 'Ej: Merma, conteo físico'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

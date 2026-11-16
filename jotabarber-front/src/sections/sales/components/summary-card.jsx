import { Box, Card, Stack, Button, Divider, TextField, Typography } from '@mui/material';

export function SummaryCard({ addedServices, discountPercent, setDiscountPercent, discountAmount, setDiscountAmount, paymentMethod, setPaymentMethod, notes, setNotes, onRegisterService, onCancel }) {
  const subtotal = addedServices.reduce((sum, service) => {
    const price = typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0;
    return sum + price;
  }, 0);
  const calculatedDiscount = subtotal * ((typeof discountPercent === 'number' ? discountPercent : parseFloat(discountPercent) || 0) / 100);
  const finalDiscount = Math.max(calculatedDiscount, typeof discountAmount === 'number' ? discountAmount : parseFloat(discountAmount) || 0);
  const total = subtotal - finalDiscount;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resumen y Finalizar
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Subtotal:</Typography>
          <Typography>S/ {subtotal.toFixed(2)}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" gutterBottom>% Descuento</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="%"
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              sx={{ width: 100 }}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
            />
            <TextField
              label="Monto"
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              sx={{ width: 150 }}
            />
            <Typography color="error">- S/ {finalDiscount.toFixed(2)}</Typography>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Total a pagar:</Typography>
          <Typography variant="h3">S/ {total.toFixed(2)}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" gutterBottom>Método de pago</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['cash', 'yape', 'card', 'transfer'].map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod(method)}
                sx={{ minWidth: 100, ...(method === 'yape' && { bgcolor: '#720e9e', color: 'white', '&:hover': { bgcolor: '#5a0b7d' } }) }}
                color={method === 'cash' ? 'success' : method === 'card' ? 'info' : 'primary'}
              >
                {method === 'cash' ? 'Efectivo' : method === 'yape' ? 'Yape' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>Notas (opcional)</Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Ingrese una observación si lo hubiese"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onRegisterService}>
            Registrar servicio
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

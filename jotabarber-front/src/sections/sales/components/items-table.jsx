import { Box, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const getPrice = (item) => (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
const getStock = (item) => (typeof item.stock === 'number' ? item.stock : parseInt(item.stock, 10) || 0);

const itemIcon = (itemType) => (itemType === 'product' ? 'mingcute:shopping-bag-2-line' : 'solar:scissors-bold');

export function ItemsTable({
  addedItems,
  onRemoveItem,
  onQuantityChange,
  subtotal,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  setDiscountAmount,
  finalDiscount,
  total,
}) {
  return (
    <TableContainer component={Box} variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right" sx={{ width: 50 }}>Acción</TableCell>
            <TableCell>Item</TableCell>
            <TableCell align="center" sx={{ width: 110 }}>Cantidad</TableCell>
            <TableCell align="right">Precio</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {addedItems.map((item) => {
            const price = getPrice(item);
            const qty = item.quantity || 1;
            const maxQty = item.itemType === 'product' ? getStock(item) : Infinity;
            const isOutOfStock = item.itemType === 'product' && getStock(item) <= 0;
            return (
              <TableRow key={`${item.itemType}-${item.id}`} sx={isOutOfStock ? { opacity: 0.6 } : undefined}>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onRemoveItem(item)} color="error">
                    <Iconify icon="mingcute:delete-2-line" width={18} />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify icon={itemIcon(item.itemType)} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          size="small"
                          label={item.itemType === 'product' ? 'Producto' : 'Servicio'}
                          color={item.itemType === 'product' ? 'info' : 'primary'}
                          variant="outlined"
                          sx={{ height: 18, fontSize: 9, '& .MuiChip-label': { px: 0.75 } }}
                        />
                        {item.itemType === 'product' && (
                          <Typography variant="caption" color={getStock(item) > 0 ? 'text.secondary' : 'error.main'} sx={{ fontSize: 10 }}>
                            Stock: {getStock(item)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                    <IconButton size="small" onClick={() => onQuantityChange(item, -1)} disabled={qty <= 1}>
                      <Iconify icon="solar:minus-linear" width={16} />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>{qty}</Typography>
                    <IconButton size="small" onClick={() => onQuantityChange(item, 1)} disabled={qty >= maxQty}>
                      <Iconify icon="solar:add-linear" width={16} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell align="right">S/ {price.toFixed(2)}</TableCell>
                <TableCell align="right" fontWeight={600}>S/ {(price * qty).toFixed(2)}</TableCell>
              </TableRow>
            );
          })}

          <TableRow>
            <TableCell colSpan={4} align="right" sx={{ borderTop: '2px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2">Subtotal</Typography>
            </TableCell>
            <TableCell align="right" sx={{ borderTop: '2px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2">S/ {subtotal.toFixed(2)}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={5} sx={{ bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary">Descuento</Typography>
                <TextField
                  label="%"
                  type="number"
                  size="small"
                  value={discountPercent === 0 ? '' : discountPercent}
                  onFocus={() => {
                    if (discountPercent === 0) {
                      setDiscountPercent('');
                    }
                  }}
                  onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  sx={{ width: 80 }}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
                <TextField
                  label="Monto"
                  type="number"
                  size="small"
                  value={discountAmount === 0 ? '' : discountAmount}
                  onFocus={() => {
                    if (discountAmount === 0) {
                      setDiscountAmount('');
                    }
                  }}
                  onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  sx={{ width: 110 }}
                />
                <Typography variant="body2" color="error" sx={{ minWidth: 70, textAlign: 'right' }}>
                  - S/ {finalDiscount.toFixed(2)}
                </Typography>
              </Stack>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={4} align="right">
              <Typography variant="subtitle1" color="primary" fontWeight={700}>Total a pagar</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" color="primary" fontWeight={700}>S/ {total.toFixed(2)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

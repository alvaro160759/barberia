import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function DetailDialog({ open, onClose, selectedBarber, details }) {
  const totalServices = details?.length || 0;
  const totalCommission = details?.reduce((sum, row) => sum + Number(row.barber_amount || 0), 0) || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="mingcute:scissors-line" width={24} />
            <Typography variant="h6">
              Detalle de Servicios
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mingcute:user-2-line" width={20} />
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
              {selectedBarber?.first_name} {selectedBarber?.last_name}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={`${totalServices} servicios`}
              color="info"
              variant="filled"
            />
            <Chip
              size="small"
              label={`S/ ${totalCommission.toFixed(2)}`}
              color="success"
              variant="filled"
            />
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Scrollbar>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Fecha y hora</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Precio (S/)</TableCell>
                <TableCell>% Comisión</TableCell>
                <TableCell>Comisión (S/)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details?.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {new Date(row.sold_at).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {row.customer_first_name || row.customer_last_name
                      ? `${row.customer_first_name || ''} ${row.customer_last_name || ''}`.trim()
                      : 'Cliente general'}
                  </TableCell>
                  <TableCell>{row.service_name}</TableCell>
                  <TableCell>S/ {row.price}</TableCell>
                  <TableCell>{row.barber_percentage}%</TableCell>
                  <TableCell>S/ {row.barber_amount}</TableCell>
                </TableRow>
              ))}
              {!details?.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay servicios en este período
                  </TableCell>
                </TableRow>
              )}
              {details?.length > 0 && (
                <TableRow sx={{ backgroundColor: 'grey.100', fontWeight: 'bold' }}>
                  <TableCell colSpan={3} align="right">
                    Total
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    S/ {totalCommission.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

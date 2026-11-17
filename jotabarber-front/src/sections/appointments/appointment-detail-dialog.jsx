import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Table from '@mui/material/Table';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

import { AppointmentStatusChip } from './appointment-status-chip';
import {
  APPOINTMENT_NEXT_ACTION,
  formatAppointmentDate,
} from './appointments-constants';

export function AppointmentDetailDialog({ open, onClose, detail, loading, actionLoading, onNextStatus }) {
  const nextAction = detail ? APPOINTMENT_NEXT_ACTION[detail.status] : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalle de la Cita</DialogTitle>
      <DialogContent dividers>
        {loading || !detail ? (
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
              <AppointmentStatusChip status={detail.status} />
            </Stack>

            <Stack spacing={0.5}>
              <span><strong>Barbero:</strong> {detail.barber_first_name} {detail.barber_last_name}</span>
              <span><strong>Fecha:</strong> {formatAppointmentDate(detail.starts_local)}</span>
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
        <Button onClick={onClose}>Cerrar</Button>
        {nextAction && (
          <Button
            variant="contained"
            disabled={actionLoading}
            onClick={() => onNextStatus(nextAction.status)}
          >
            {nextAction.label}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

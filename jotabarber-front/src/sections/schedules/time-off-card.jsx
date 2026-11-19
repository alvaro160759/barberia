import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

function barberLabel(barber) {
  return `${barber.first_name ?? ''} ${barber.last_name ?? ''}`.trim();
}

function formatUtc(value) {
  if (!value) return '-';
  const parsed = dayjs(`${String(value).replace(' ', 'T')}Z`);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : String(value);
}

export function TimeOffCard({ barbers, timeOff, loading, onCreate, onDelete, barberName }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [barber, setBarber] = useState(null);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await onCreate({
        employee_id: barber.id,
        starts_at: startsAt,
        ends_at: endsAt,
        reason,
      });
      setDialogOpen(false);
      setBarber(null);
      setStartsAt('');
      setEndsAt('');
      setReason('');
    } catch {
      // error ya notificado por el hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<Iconify icon="solar:calendar-cross-bold-duotone" width={28} sx={{ color: 'primary.main' }} />}
        title="Bloqueos de agenda"
        subheader="Vacaciones, permisos u otros días sin atención"
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setDialogOpen(true)}
          >
            Nuevo bloqueo
          </Button>
        }
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : timeOff.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 3 }}>
          No hay bloqueos registrados.
        </Typography>
      ) : (
        <TableContainer sx={{ px: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Barbero</TableCell>
                <TableCell>Desde</TableCell>
                <TableCell>Hasta</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell width={56} />
              </TableRow>
            </TableHead>
            <TableBody>
              {timeOff.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{barberName(item.employee_id)}</TableCell>
                  <TableCell>{formatUtc(item.starts_at)}</TableCell>
                  <TableCell>{formatUtc(item.ends_at)}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={item.reason || '-'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
                      <Iconify icon="mingcute:delete-2-line" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nuevo bloqueo de agenda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              size="small"
              options={barbers}
              value={barber}
              onChange={(event, value) => setBarber(value)}
              getOptionLabel={barberLabel}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Barbero" required />}
            />
            <TextField
              label="Desde"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Hasta"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              error={!!endsAt && !!startsAt && endsAt <= startsAt}
              helperText={endsAt && startsAt && endsAt <= startsAt ? 'El fin debe ser posterior al inicio' : ''}
            />
            <TextField
              label="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              saving ||
              !barber ||
              !startsAt ||
              !endsAt ||
              endsAt <= startsAt ||
              !reason.trim()
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

function barberLabel(barber) {
  return `${barber.first_name ?? ''} ${barber.last_name ?? ''}`.trim();
}

export function WeeklyScheduleCard({
  barbers,
  selectedBarberId,
  onBarberChange,
  schedulesByWeekday,
  loading,
  onReplace,
  onClear,
  slotInterval,
  intervalOptions,
  savingInterval,
  onSaveInterval,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [weekday, setWeekday] = useState(null);
  const [startsAt, setStartsAt] = useState('09:00');
  const [endsAt, setEndsAt] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const [intervalValue, setIntervalValue] = useState(slotInterval);
  const [intervalDirty, setIntervalDirty] = useState(false);
  const [confirmDay, setConfirmDay] = useState(null);

  const openDialog = (day) => {
    setWeekday(day.value);
    setEditing(day.ranges.length > 0);
    const first = day.ranges[0];
    setStartsAt(first?.starts_at || '09:00');
    setEndsAt(first?.ends_at || '18:00');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onReplace({
        employee_id: Number(selectedBarberId),
        weekday,
        starts_at: startsAt,
        ends_at: endsAt,
      });
      setDialogOpen(false);
    } catch {
      // error ya notificado por el hook
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await onClear({ employee_id: Number(selectedBarberId), weekday });
      setDialogOpen(false);
    } catch {
      // error ya notificado por el hook
    } finally {
      setSaving(false);
    }
  };

  const handleClearDay = async () => {
    setSaving(true);
    try {
      await onClear({ employee_id: Number(selectedBarberId), weekday: confirmDay });
      setConfirmDay(null);
    } catch {
      // error ya notificado por el hook
    } finally {
      setSaving(false);
    }
  };

  const currentInterval = intervalDirty ? intervalValue : slotInterval;

  const handleSaveInterval = async () => {
    await onSaveInterval(currentInterval);
    setIntervalDirty(false);
  };

  const dayLabel = schedulesByWeekday.find((d) => d.value === weekday)?.label;

  return (
    <Card>
      <CardHeader
        avatar={<Iconify icon="solar:calendar-mark-bold-duotone" width={28} sx={{ color: 'primary.main' }} />}
        title="Horarios semanales"
        subheader="Turno de atención del barbero por día de la semana"
        action={
          <Autocomplete
            size="small"
            sx={{ minWidth: 220 }}
            options={barbers}
            value={barbers.find((b) => String(b.id) === String(selectedBarberId)) || null}
            onChange={(event, value) => onBarberChange(value ? String(value.id) : '')}
            getOptionLabel={barberLabel}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Barbero" />}
          />
        }
      />

      {selectedBarberId && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          sx={{ px: 3, pb: 2 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 190 }}>
            Intervalo de disponibilidad
          </Typography>
          <TextField
            select
            size="small"
            label="Cada"
            value={currentInterval}
            onChange={(e) => {
              setIntervalValue(Number(e.target.value));
              setIntervalDirty(true);
            }}
            sx={{ minWidth: 140 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            }}
          >
            {intervalOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option} min
              </MenuItem>
            ))}
          </TextField>
          <Button
            size="small"
            variant="outlined"
            disabled={!intervalDirty || savingInterval || currentInterval === slotInterval}
            onClick={handleSaveInterval}
          >
            Guardar intervalo
          </Button>
        </Stack>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : !selectedBarberId ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 3 }}>
          No hay barberos registrados en esta sucursal.
        </Typography>
      ) : (
        <Box sx={{ px: 3, pb: 3 }}>
          {schedulesByWeekday.map((day, index) => {
            const hasSchedule = day.ranges.length > 0;
            return (
              <Box key={day.value}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                  sx={{ py: 1 }}
                >
                  <Typography variant="subtitle2" sx={{ width: { sm: 110 }, flexShrink: 0 }}>
                    {day.label}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {hasSchedule ? (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {day.ranges.map((range) => (
                          <Chip
                            key={range.id}
                            size="small"
                            variant="outlined"
                            color="primary"
                            label={`${range.starts_at} - ${range.ends_at}`}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        No laborable
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    {hasSchedule && (
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => setConfirmDay(day.value)}
                        title="Marcar como no laborable"
                      >
                        <Iconify icon="solar:calendar-cross-bold" />
                      </IconButton>
                    )}
                    <Button
                      size="small"
                      variant={hasSchedule ? 'outlined' : 'contained'}
                      startIcon={
                        <Iconify icon={hasSchedule ? 'mingcute:edit-line' : 'mingcute:add-line'} />
                      }
                      onClick={() => openDialog(day)}
                      sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                    >
                      {hasSchedule ? 'Editar' : 'Agregar'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editing ? 'Editar horario' : 'Agregar horario'} — {dayLabel}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Hora de inicio"
              type="time"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Hora de fin"
              type="time"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={endsAt <= startsAt}
              helperText={endsAt <= startsAt ? 'La hora de fin debe ser mayor a la de inicio' : ''}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {editing && (
            <Button color="error" onClick={handleClear} disabled={saving}>
              Quitar
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !startsAt || !endsAt || endsAt <= startsAt}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDay !== null}
        onClose={() => setConfirmDay(null)}
        title="Día no laborable"
        content={`¿Marcar ${schedulesByWeekday.find((d) => d.value === confirmDay)?.label ?? ''} como no laborable? El barbero no aparecerá en la reserva ese día.`}
        action={
          <Button variant="contained" color="error" onClick={handleClearDay} disabled={saving}>
            Sí, quitar
          </Button>
        }
      />
    </Card>
  );
}

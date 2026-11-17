import dayjs from 'dayjs';
import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_STATUS_COLORS,
} from './appointments-constants';

const DATE_PRESETS = [
  { key: 'today', label: 'Hoy' },
  { key: 'tomorrow', label: 'Mañana' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'all', label: 'Todas' },
];

function getPresetRange(key) {
  const today = dayjs();
  switch (key) {
    case 'today':
      return { from: today.format('YYYY-MM-DD'), to: today.format('YYYY-MM-DD') };
    case 'tomorrow': {
      const tomorrow = today.add(1, 'day');
      return { from: tomorrow.format('YYYY-MM-DD'), to: tomorrow.format('YYYY-MM-DD') };
    }
    case 'week':
      return {
        from: today.startOf('week').format('YYYY-MM-DD'),
        to: today.endOf('week').format('YYYY-MM-DD'),
      };
    case 'month':
      return {
        from: today.startOf('month').format('YYYY-MM-DD'),
        to: today.endOf('month').format('YYYY-MM-DD'),
      };
    default:
      return { from: '', to: '' };
  }
}

function statusDotColor(status) {
  const color = APPOINTMENT_STATUS_COLORS[status];
  return color === 'default' ? 'text.disabled' : `${color}.main`;
}

export function AppointmentFilters({
  branches,
  selectedBranch,
  onBranchChange,
  barbers,
  filters,
  onFilterChange,
  onBarberChange,
  onApplyFilters,
  onClearFilters,
  onApplyDateRange,
  hasActiveFilters,
  count,
  onRefresh,
}) {
  const selectedBarber = useMemo(
    () => barbers.find((barber) => String(barber.id) === String(filters.barber_id)) || null,
    [barbers, filters.barber_id]
  );

  const activePreset = DATE_PRESETS.find((preset) => {
    const range = getPresetRange(preset.key);
    return filters.from === range.from && filters.to === range.to;
  })?.key;

  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ flexWrap: 'wrap' }}
      >
        <TextField
          select
          size="small"
          label="Sede"
          value={selectedBranch}
          onChange={onBranchChange}
          disabled={branches.length === 0}
          helperText={branches.length === 0 ? 'No tienes sucursales asignadas' : undefined}
          sx={{ minWidth: { xs: 1, md: 200 }, flex: { xs: 1, md: '0 0 auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:buildings-2-bold-duotone" width={20} />
              </InputAdornment>
            ),
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            Sede actual
          </MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={String(branch.id)}>
              {branch.name}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          size="small"
          options={barbers}
          value={selectedBarber}
          onChange={(event, value) => onBarberChange(value ? value.id : '')}
          getOptionLabel={(barber) => `${barber.first_name} ${barber.last_name}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Sin barberos"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Barbero"
              placeholder="Todos"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <Iconify icon="solar:user-bold-duotone" width={20} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ minWidth: { xs: 1, md: 200 }, flex: { xs: 1, md: '0 0 auto' } }}
        />

        <TextField
          select
          size="small"
          label="Estado"
          value={filters.status}
          onChange={onFilterChange('status')}
          sx={{ minWidth: { xs: 1, md: 160 }, flex: { xs: 1, md: '0 0 auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:flag-bold-duotone" width={20} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {APPOINTMENT_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  mr: 1.5,
                  flexShrink: 0,
                  bgcolor: statusDotColor(option.value),
                }}
              />
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Desde"
          type="date"
          size="small"
          value={filters.from}
          onChange={onFilterChange('from')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: 1, md: 150 }, flex: { xs: 1, md: '0 0 auto' } }}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={filters.to}
          onChange={onFilterChange('to')}
          inputProps={{ min: filters.from || undefined }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: 1, md: 150 }, flex: { xs: 1, md: '0 0 auto' } }}
        />
      </Stack>

      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          Rango rápido:
        </Typography>
        {DATE_PRESETS.map((preset) => (
          <Chip
            key={preset.key}
            size="small"
            variant={activePreset === preset.key ? 'filled' : 'outlined'}
            color={activePreset === preset.key ? 'primary' : 'default'}
            label={preset.label}
            onClick={() => onApplyDateRange(getPresetRange(preset.key))}
            sx={{ cursor: 'pointer' }}
          />
        ))}

        <Box sx={{ flex: '1 1 auto' }} />

        <Button
          variant="contained"
          size="small"
          onClick={onApplyFilters}
          startIcon={<Iconify icon="mingcute:search-line" />}
        >
          Filtrar
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Limpiar
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {count} {count === 1 ? 'cita' : 'citas'}
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton size="small" onClick={onRefresh}>
            <Iconify icon="solar:refresh-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

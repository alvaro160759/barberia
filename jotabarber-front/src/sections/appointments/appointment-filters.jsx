import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';

import { APPOINTMENT_STATUS_OPTIONS } from './appointments-constants';

export function AppointmentFilters({
  branches,
  selectedBranch,
  onBranchChange,
  barbers,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ p: 2.5, flexWrap: 'wrap' }}
    >
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Sede</InputLabel>
        <TextField
          select
          label="Sede"
          value={selectedBranch}
          onChange={onBranchChange}
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
      </FormControl>
      <TextField
        label="Desde"
        type="date"
        size="small"
        value={filters.from}
        onChange={onFilterChange('from')}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 160 }}
      />
      <TextField
        label="Hasta"
        type="date"
        size="small"
        value={filters.to}
        onChange={onFilterChange('to')}
        inputProps={{ min: filters.from || undefined }}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 160 }}
      />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Barbero</InputLabel>
        <TextField
          select
          label="Barbero"
          value={filters.barber_id}
          onChange={onFilterChange('barber_id')}
        >
          <MenuItem value="">Todos</MenuItem>
          {barbers.map((barber) => (
            <MenuItem key={barber.id} value={barber.id}>
              {barber.first_name} {barber.last_name}
            </MenuItem>
          ))}
        </TextField>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Estado</InputLabel>
        <TextField
          select
          label="Estado"
          value={filters.status}
          onChange={onFilterChange('status')}
        >
          <MenuItem value="">Todos</MenuItem>
          {APPOINTMENT_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FormControl>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={onApplyFilters} startIcon={<Iconify icon="mingcute:search-line" />}>
          Filtrar
        </Button>
        <Button variant="outlined" onClick={onClearFilters}>
          Limpiar
        </Button>
      </Stack>
    </Stack>
  );
}

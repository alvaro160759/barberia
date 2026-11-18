import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

export function FilterCard({ period, date, barberId, serviceId, branchId, barbers, services, branches, onPeriodChange, onDateChange, onBarberChange, onServiceChange, onBranchChange, onFilter }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
        <TextField
          select
          label="Periodo"
          size='small'
          value={period}
          onChange={onPeriodChange}
          sx={{ width: { xs: 1, md: 180 } }}
        >
          <MenuItem value="day">Día</MenuItem>
          <MenuItem value="week">Semana</MenuItem>
          <MenuItem value="month">Mes</MenuItem>
          <MenuItem value="year">Año</MenuItem>
          <MenuItem value="custom">Rango personalizado</MenuItem>
        </TextField>

        <TextField
          label="Fecha"
          type="date"
          size='small'
          value={date}
          onChange={onDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: 1, md: 180 } }}
        />

        <Autocomplete
          size="small"
          options={barbers}
          getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
          value={barbers.find((b) => b.id === parseInt(barberId, 10)) || null}
          onChange={(e, newValue) => onBarberChange(newValue ? parseInt(newValue.id, 10) : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Barbero"
              sx={{ width: { xs: 1, md: 350 } }}
            />
          )}
          sx={{ width: { xs: 1, md: 350 } }}
        />

        <Autocomplete
          size="small"
          options={branches}
          getOptionLabel={(option) => option.name}
          value={branches.find((b) => b.id === parseInt(branchId, 10)) || null}
          onChange={(e, newValue) => onBranchChange(newValue ? parseInt(newValue.id, 10) : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sede"
              sx={{ width: { xs: 1, md: 250 } }}
            />
          )}
          sx={{ width: { xs: 1, md: 250 } }}
        />

        <Button variant="contained" onClick={onFilter} sx={{ width: { xs: 1, md: 120 } }}>
          Filtrar
        </Button>
      </Stack>
    </Card>
  );
}

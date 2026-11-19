import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

export function FilterCard({
  period,
  date,
  monthValue,
  yearValue,
  rangeFrom,
  rangeTo,
  barberId,
  serviceId,
  branchId,
  barbers,
  services,
  branches,
  onPeriodChange,
  onDateChange,
  onMonthChange,
  onYearChange,
  onRangeFromChange,
  onRangeToChange,
  onBarberChange,
  onServiceChange,
  onBranchChange,
  onFilter,
  onClear,
  dateRangeLabel,
}) {
  return (
    <Card sx={{ mb: 3 }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Periodo"
              size="small"
              value={period}
              onChange={onPeriodChange}
              fullWidth
            >
              <MenuItem value="day">Día</MenuItem>
              <MenuItem value="week">Semana</MenuItem>
              <MenuItem value="month">Mes</MenuItem>
              <MenuItem value="year">Año</MenuItem>
              <MenuItem value="custom">Rango de fechas</MenuItem>
            </TextField>
          </Grid>

          {(period === 'day' || period === 'week') && (
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha"
                type="date"
                size="small"
                value={date}
                onChange={onDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          )}

          {period === 'month' && (
            <Grid item xs={12} sm={3}>
              <TextField
                label="Mes"
                type="month"
                size="small"
                value={monthValue}
                onChange={onMonthChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          )}

          {period === 'year' && (
            <Grid item xs={12} sm={3}>
              <TextField
                label="Año"
                type="number"
                size="small"
                value={yearValue}
                onChange={onYearChange}
                inputProps={{ min: 2020, max: 2100 }}
                fullWidth
              />
            </Grid>
          )}

          {period === 'custom' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Desde"
                  type="date"
                  size="small"
                  value={rangeFrom}
                  onChange={onRangeFromChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Hasta"
                  type="date"
                  size="small"
                  value={rangeTo}
                  onChange={onRangeToChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={3}>
            <Autocomplete
              size="small"
              options={barbers}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={barbers.find((b) => b.id === parseInt(barberId, 10)) || null}
              onChange={(e, newValue) => onBarberChange(newValue ? parseInt(newValue.id, 10) : '')}
              renderInput={(params) => <TextField {...params} label="Barbero" />}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Autocomplete
              size="small"
              options={branches}
              getOptionLabel={(option) => option.name || ''}
              value={branches.find((b) => b.id === parseInt(branchId, 10)) || null}
              onChange={(e, newValue) => onBranchChange(newValue ? parseInt(newValue.id, 10) : '')}
              renderInput={(params) => <TextField {...params} label="Sucursal" />}
              fullWidth
            />
          </Grid>
        </Grid>

        {dateRangeLabel && (
          <Typography variant="caption" color="text.secondary">
            Mostrando datos del {dateRangeLabel}
          </Typography>
        )}

        {onClear && (
            <Button variant="outlined" onClick={onClear}>
              Limpiar Filtros
            </Button>
          )}
      </Stack>
    </Card>
  );
}

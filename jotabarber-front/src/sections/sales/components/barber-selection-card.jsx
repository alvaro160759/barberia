import { useState } from 'react';
import { Avatar, Box, Card, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';

export function BarberSelectionCard({ employees, loading, selectedBarber, setSelectedBarber }) {
  const [barberSearch, setBarberSearch] = useState('');

  const barbers = employees.filter((emp) => emp.job_type === 'BARBER');

  const filteredBarbers = barbers.filter((emp) => {
    if (!barberSearch) return true;
    const search = barberSearch.toLowerCase();
    const fullName = [emp.first_name, emp.last_name].filter((n) => typeof n === 'string').join(' ').toLowerCase();
    return fullName.includes(search);
  });

  const getInitials = (employee) => {
    const first = typeof employee.first_name === 'string' ? employee.first_name.charAt(0) : '';
    const last = typeof employee.last_name === 'string' ? employee.last_name.charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (employee) =>
    [employee.first_name, employee.last_name].filter((n) => typeof n === 'string' && n).join(' ') || 'Empleado';

  return (
    <Card sx={{ p: 3, mb: 3, height: 320, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
          Seleccionar Barbero
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar barbero..."
          value={barberSearch}
          onChange={(e) => setBarberSearch(e.target.value)}
          InputProps={{
            startAdornment: <Iconify icon="mingcute:search-line" sx={{ mr: 1, color: 'text.disabled' }} />,
          }}
        />
      </Stack>

      {loading ? (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexGrow: 1,
            overflowX: 'auto',
            pb: 1,
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Paper
              key={index}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 2,
                textAlign: 'center',
                width: 180,
                flexShrink: 0,
              }}
            >
              <Skeleton variant="circular" width={72} height={72} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
            </Paper>
          ))}
        </Stack>
      ) : filteredBarbers.length === 0 ? (
        <Box sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {barberSearch ? 'No se encontraron barberos' : 'No hay barberos disponibles'}
          </Typography>
        </Box>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexGrow: 1,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 3 },
          }}
        >
          {filteredBarbers.map((employee) => {
            const isSelected = selectedBarber?.id === employee.id;
            return (
              <Paper
                key={employee.id}
                onClick={() => setSelectedBarber(isSelected ? null : employee)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'grey.300',
                  bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                  borderRadius: 2,
                  width: 180,
                  height: '100%',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isSelected ? 'primary.main' : 'primary.light',
                    boxShadow: 2,
                  },
                }}
              >
                <Avatar
                  src={employee.avatar ? `${CONFIG.site.serverUrl}${employee.avatar}` : undefined}
                  sx={{
                    mb: 1,
                    width: 72,
                    height: 72,
                    bgcolor: isSelected ? 'primary.main' : 'grey.300',
                    color: isSelected ? 'white' : 'grey.700',
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                >
                  {getInitials(employee)}
                </Avatar>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ display: 'block', maxWidth: '100%' }}>
                  {getFullName(employee)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Barbero
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}

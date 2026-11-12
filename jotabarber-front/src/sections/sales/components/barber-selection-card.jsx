import { Avatar, Card, Paper, Stack, Typography } from '@mui/material';

export function BarberSelectionCard({ employees, selectedBarber, setSelectedBarber }) {
  const barbers = employees.filter(emp => emp.job_type === 'BARBER');

  return (
    <Card sx={{ p: 3, mb: 3, minHeight: 232, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Seleccionar Barbero
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {barbers.map((employee) => (
          <Paper
            key={employee.id}
            onClick={() => setSelectedBarber(employee)}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: selectedBarber?.id === employee.id ? 2 : 1,
              borderColor: selectedBarber?.id === employee.id ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              textAlign: 'center',
              minWidth: 120,
            }}
          >
            <Avatar sx={{ mx: 'auto', mb: 1, width: 60, height: 60 }}>
              {typeof employee.first_name === 'string' ? employee.first_name.charAt(0) : '?'}
            </Avatar>
            <Typography variant="body2">{typeof employee.first_name === 'string' ? employee.first_name : 'Empleado'}</Typography>
            <Typography variant="caption" color="text.secondary">Barbero</Typography>
          </Paper>
        ))}
      </Stack>
    </Card>
  );
}

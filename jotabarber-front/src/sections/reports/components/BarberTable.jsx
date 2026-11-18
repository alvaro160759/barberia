import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const formatMoney = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

export function BarberTable({ byBarber, summary, onViewDetail }) {
  return (
    <Card>
      <Stack>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Barbero</TableCell>
                <TableCell align="center">Servicios</TableCell>
                <TableCell align="right">Ingresos</TableCell>
                <TableCell align="right">Comisión</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byBarber.map((barber, index) => (
                <TableRow
                  key={barber.barber_id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onViewDetail(barber)}
                >
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: (theme) => theme.palette.primary.main,
                          width: 36,
                          height: 36,
                        }}
                      >
                        {barber.first_name?.[0]}{barber.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {barber.first_name} {barber.last_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={barber.services_count}
                      size="small"
                      color="info"
                      variant="contained"
                    />
                  </TableCell>
                  <TableCell align="right" fontWeight={600}>
                    {formatMoney(barber.services_sales)}
                  </TableCell>
                  <TableCell align="right" fontWeight={600} color="success.main">
                    {formatMoney(barber.barber_earned)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(barber);
                      }}
                      startIcon={<Iconify icon="mdi:eye" />}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell colSpan={2} align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {summary?.services_count || 0}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {formatMoney(summary?.total_sales)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {formatMoney(summary?.total_commissions)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </Stack>
    </Card>
  );
}

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

export function BarberTable({ byBarber, summary, onViewDetail, onSettle }) {
  return (
    <Card>
      <Stack>
        <Scrollbar>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Barbero</TableCell>
                <TableCell align="center">Servicios</TableCell>
                <TableCell align="right">Ingresos</TableCell>
                <TableCell align="right">Comisión</TableCell>
                <TableCell align="right">Pagado</TableCell>
                <TableCell align="right">Pendiente</TableCell>
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
                  <TableCell align="right" sx={{ color: 'success.dark' }}>
                    {formatMoney(barber.paid_amount)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: Number(barber.pending_amount) > 0 ? 'warning.dark' : 'text.secondary', fontWeight: Number(barber.pending_amount) > 0 ? 600 : 400 }}>
                    {formatMoney(barber.pending_amount)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
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
                      {onSettle && Number(barber.pending_amount) > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSettle(barber);
                          }}
                          startIcon={<Iconify icon="mingcute:cash-line" />}
                        >
                          Liquidar
                        </Button>
                      )}
                    </Stack>
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
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'success.dark' }}>
                  {formatMoney(summary?.total_paid)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'warning.dark' }}>
                  {formatMoney(summary?.total_pending)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </Stack>
    </Card>
  );
}

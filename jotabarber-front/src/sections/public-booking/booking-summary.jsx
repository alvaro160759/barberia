import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

function SummaryRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <Box display="flex" alignItems="flex-start" sx={{ mb: 1.5 }}>
      <Iconify icon={icon} width={18} sx={{ mr: 1.25, mt: '2px', color: 'text.secondary', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function BookingSummary({ branch, barber, services = [], selectedServiceIds = [], date, time }) {
  const selectedServices = services.filter((service) =>
    selectedServiceIds.includes(Number(service.id))
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration_minutes), 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);

  const formattedDate = date ? dayjs(date).format('ddd DD/MM/YYYY') : null;
  const hasSelections = branch || barber || selectedServices.length > 0 || (date && time);

  return (
    <Card
      sx={{
        width: 300,
        flexShrink: 0,
        display: { xs: 'none', lg: 'block' },
        position: 'sticky',
        top: 24,
        alignSelf: 'flex-start',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <Iconify icon="solar:receipt-bold-duotone" width={22} sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Tu reserva
          </Typography>
        </Box>

        {!hasSelections ? (
          <Typography variant="body2" color="text.secondary">
            Completa los pasos y aquí verás el resumen de tu reserva.
          </Typography>
        ) : (
          <>
            <SummaryRow icon="solar:buildings-2-bold-duotone" label="Sede" value={branch?.name} />
            <SummaryRow
              icon="solar:user-bold-duotone"
              label="Barbero"
              value={barber ? `${barber.first_name} ${barber.last_name}` : null}
            />
            <SummaryRow
              icon="solar:calendar-mark-bold-duotone"
              label="Fecha y hora"
              value={formattedDate && time ? `${formattedDate} · ${time}` : formattedDate}
            />
            {selectedServices.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Box display="flex" alignItems="flex-start">
                  <Iconify icon="solar:scissors-bold-duotone" width={18} sx={{ mr: 1.25, mt: '2px', color: 'text.secondary', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                      Servicios
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}
                    </Typography>
                    {selectedServices.map((service) => (
                      <Typography key={service.id} variant="caption" color="text.secondary" display="block">
                        · {service.name}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {selectedServices.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2">
                  Total estimado: S/ {totalPrice.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Duración aproximada: {totalDuration} min
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

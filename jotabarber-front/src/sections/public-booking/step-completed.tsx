import type { CreatedAppointment } from 'src/hooks/use-public-booking';

import { QRCodeSVG } from 'qrcode.react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

interface CompletedStepProps {
  appointmentData: CreatedAppointment | null;
  onReset: () => void;
}

export function CompletedStep({ appointmentData, onReset }: CompletedStepProps) {
  const qrValue = appointmentData ? JSON.stringify({
    id: appointmentData.id,
    code: appointmentData.code || appointmentData.id
  }) : '';

  return (
    <Box
      gap={3}
      display="flex"
      flex="1 1 auto"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      sx={{ borderRadius: 'inherit', bgcolor: 'background.neutral', p: 3 }}
    >
      <Iconify icon="solar:check-circle-bold" width={80} color="success.main" />

      <Typography variant="h5" textAlign="center">
        ¡Reserva Creada Exitosamente!
      </Typography>

      <Typography variant="body1" textAlign="center" color="text.secondary">
        Tu código de reserva es: <strong>{appointmentData?.id}</strong>
      </Typography>

      {appointmentData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
          <QRCodeSVG value={qrValue} size={150} />
        </Box>
      )}

      <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
        Escanea este código QR en la sucursal para validar tu reserva
      </Typography>

      <Button
        variant="outlined"
        onClick={onReset}
        startIcon={<Iconify icon="solar:restart-bold" />}
        sx={{ mt: 2 }}
      >
        Nueva Reserva
      </Button>
    </Box>
  );
}

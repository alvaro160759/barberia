import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { publicBookingApi } from 'src/api/public-booking';

export function ConfirmStep({ branch, barber, date, time, services = [] }) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const dni = watch('stepFive.customer_dni');
  const customerError = errors.stepFive?.customer_name?.message
    || errors.stepFive?.customer_phone?.message
    || errors.stepFive?.customer_email?.message
    || errors.stepFive?.customer_dni?.message;
  const selectedIds = watch('stepThree.service_ids') || [];
  const [searchingDni, setSearchingDni] = useState(false);
  const [nameLocked, setNameLocked] = useState(false);
  const lastSearchedDni = useRef('');

  useEffect(() => {
    const cleanDni = (dni || '').replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      setNameLocked(false);
      return;
    }
    if (cleanDni === lastSearchedDni.current) return;

    lastSearchedDni.current = cleanDni;
    const search = async () => {
      setSearchingDni(true);
      try {
        const response = await publicBookingApi.getDni(cleanDni);
        const person = response.data;
        if (person?.full_name) {
          setValue('stepFive.customer_name', person.full_name, { shouldValidate: true });
          setNameLocked(true);
          toast.success(`Cliente encontrado: ${person.full_name}`);
        }
      } catch (error) {
        lastSearchedDni.current = '';
        setNameLocked(false);
        const message = error?.response?.data?.message || 'No se pudo consultar el DNI';
        toast.error(message);
      } finally {
        setSearchingDni(false);
      }
    };
    search();
  }, [dni, setValue]);

  const selectedServices = services.filter((service) =>
    selectedIds.includes(Number(service.id))
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration_minutes), 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <Iconify icon="solar:clipboard-check-bold-duotone" width={22} sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Confirma tu reserva
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            <strong>Sede:</strong> {branch?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Barbero:</strong> {barber?.first_name} {barber?.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Fecha:</strong> {date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Horario:</strong> {time}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Servicios:</strong>
          </Typography>
          {selectedServices.map((service) => (
            <Typography key={service.id} variant="body2" color="text.secondary" sx={{ pl: 2 }}>
              • {service.name} — S/ {service.price} — {service.duration_minutes} min
            </Typography>
          ))}
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Total estimado:</strong> S/ {totalPrice.toFixed(2)} ({totalDuration} min)
          </Typography>
        </CardContent>
      </Card>

      <Box display="flex" alignItems="center" sx={{ mt: 3, mb: 2 }}>
        <Iconify icon="solar:user-id-bold-duotone" width={20} sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Tus datos
        </Typography>
      </Box>

      {customerError && (
        <Typography variant="caption" color="error" sx={{ mb: 1.5, display: 'block' }}>
          {customerError}
        </Typography>
      )}

      <Field.Text
        name="stepFive.customer_dni"
        label={searchingDni ? 'Consultando DNI...' : 'DNI (opcional)'}
        fullWidth
        disabled={searchingDni}
        sx={{ mb: 2 }}
      />

      <Field.Text
        name="stepFive.customer_name"
        label="Nombre Completo"
        fullWidth
        disabled={nameLocked}
        sx={{ mb: 2 }}
      />

      <Field.Text
        name="stepFive.customer_phone"
        label="Teléfono"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Field.Text
        name="stepFive.customer_email"
        label="Correo Electrónico (opcional)"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Field.Text
        name="stepFive.notes"
        label="Notas adicionales (opcional)"
        multiline
        rows={3}
        fullWidth
      />
    </Box>
  );
}

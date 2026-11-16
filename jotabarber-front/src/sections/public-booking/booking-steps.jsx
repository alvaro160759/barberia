import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { publicBookingApi } from 'src/api/public-booking';

export function Stepper({ steps, activeStep }) {
  return (
    <MuiStepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            sx={{
              '& .MuiStepLabel-label': { display: { xs: 'none', sm: 'block' } },
            }}
            StepIconComponent={({ active, completed }) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  color: 'text.disabled',
                  typography: 'subtitle2',
                  bgcolor: 'action.disabledBackground',
                  ...(active && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                  ...(completed && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                }}
              >
                {completed ? (
                  <Iconify width={14} icon="mingcute:check-fill" />
                ) : (
                  <Box sx={{ typography: 'subtitle2' }}>{index + 1}</Box>
                )}
              </Box>
            )}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}

export function StepOne({ branches, loading }) {
  const { watch, setValue } = useFormContext();
  const selectedId = watch('stepOne.branch_id');

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
        Selecciona la sede
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {branches.map((branch) => {
            const selected = Number(selectedId) === Number(branch.id);
            return (
              <Grid item xs={12} sm={6} key={branch.id}>
                <Card
                  onClick={() => setValue('stepOne.branch_id', Number(branch.id), { shouldValidate: true })}
                  sx={{
                    cursor: 'pointer',
                    height: 1,
                    border: (theme) => `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                    borderWidth: selected ? 2 : 1,
                    bgcolor: selected ? 'primary.lighter' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1">{branch.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {branch.address}
                    </Typography>
                    {branch.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {branch.phone}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export function StepTwo({ barbers, loading }) {
  const { watch, setValue } = useFormContext();
  const selectedId = watch('stepTwo.barber_id');

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
        Selecciona el barbero
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {barbers.map((barber) => {
            const selected = Number(selectedId) === Number(barber.id);
            const initials = `${barber.first_name?.[0] ?? ''}${barber.last_name?.[0] ?? ''}`;
            return (
              <Grid item xs={12} sm={6} key={barber.id}>
                <Card
                  onClick={() => setValue('stepTwo.barber_id', Number(barber.id), { shouldValidate: true })}
                  sx={{
                    cursor: 'pointer',
                    height: 1,
                    border: (theme) => `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                    borderWidth: selected ? 2 : 1,
                    bgcolor: selected ? 'primary.lighter' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Avatar
                      src={barber.photo_url || barber.avatar_url || undefined}
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', flexShrink: 0 }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {barber.first_name} {barber.last_name}
                      </Typography>
                      <Rating value={barber.rating ?? 5} readOnly size="small" />
                      {barber.phone && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {barber.phone}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export function StepServices({ services, loadingServices }) {
  const { watch, setValue } = useFormContext();
  const selectedIds = watch('stepThree.service_ids') || [];

  const toggleService = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];
    setValue('stepThree.service_ids', next, { shouldValidate: true });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
        Selecciona los servicios que deseas
      </Typography>

      {loadingServices ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Typography variant="body2" color="error">
          No hay servicios disponibles en esta sede.
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {services.map((service) => {
            const selected = selectedIds.includes(Number(service.id));
            return (
              <Grid item xs={12} sm={6} key={service.id}>
                <Card
                  onClick={() => toggleService(Number(service.id))}
                  sx={{
                    cursor: 'pointer',
                    height: 1,
                    border: (theme) => `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                    borderWidth: selected ? 2 : 1,
                    bgcolor: selected ? 'primary.lighter' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: selected ? 'primary.dark' : 'background.neutral', color: selected ? 'primary.contrastText' : 'text.secondary', flexShrink: 0 }}>
                      <Iconify icon="solar:scissors-bold" width={24} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        S/ {service.price} · {service.duration_minutes} min
                      </Typography>
                    </Box>
                    {selected && (
                      <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'primary.main', flexShrink: 0 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export function StepSchedule({ schedules, loading }) {
  const { watch, setValue } = useFormContext();
  const selectedTime = watch('stepFour.time');

  return (
    <Box>
      <Field.DatePicker
        name="stepFour.date"
        label="Seleccionar Fecha"
        fullWidth
        minDate={dayjs()}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Horarios Disponibles
          </Typography>

          {schedules.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay horarios disponibles para la fecha seleccionada. Por favor, seleccione otra fecha.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {schedules.map((schedule) => {
                const selected = selectedTime === schedule.time;
                return (
                  <Grid item xs={4} sm={3} md={2} key={schedule.time}>
                    <Card
                      onClick={() => schedule.available && setValue('stepFour.time', schedule.time, { shouldValidate: true })}
                      sx={{
                        cursor: schedule.available ? 'pointer' : 'not-allowed',
                        opacity: schedule.available ? 1 : 0.45,
                        bgcolor: schedule.available ? (selected ? 'primary.lighter' : 'background.paper') : 'action.hover',
                        border: (theme) => `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                        borderWidth: selected ? 2 : 1,
                        transition: 'all 0.2s',
                        '&:hover': schedule.available ? { borderColor: 'primary.main' } : {},
                      }}
                    >
                      <CardContent sx={{ py: 1.5, px: 1, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                          {schedule.time}
                        </Typography>
                        <Typography variant="caption" color={selected ? 'primary.main' : schedule.available ? 'text.secondary' : 'text.disabled'}>
                          {selected ? 'Seleccionado' : schedule.available ? 'Disponible' : 'Ocupado'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

export function StepConfirm({ branch, barber, date, time, services = [] }) {
  const { watch, setValue } = useFormContext();
  const dni = watch('stepFive.customer_dni');
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
  const selectedIds = watch('stepThree.service_ids') || [];
  const selectedServices = services.filter((service) =>
    selectedIds.includes(Number(service.id))
  );
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration_minutes), 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resumen de la Reserva
      </Typography>

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

export function StepCompleted({ appointmentData, onReset }) {
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

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { publicBookingApi } from 'src/api/public-booking';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { Stepper, StepOne, StepTwo, StepConfirm, StepServices, StepSchedule, StepCompleted } from './booking-steps';

const steps = ['Seleccionar Sede', 'Seleccionar Barbero', 'Seleccionar Servicios', 'Seleccionar Horario', 'Confirmar Reserva'];

const StepOneSchema = zod.object({
  branch_id: zod.number().min(1, { message: 'Debe seleccionar una sede' }),
});

const StepTwoSchema = zod.object({
  barber_id: zod.number().min(1, { message: 'Debe seleccionar un barbero' }),
});

const StepThreeSchema = zod.object({
  service_ids: zod.array(zod.number()).min(1, { message: 'Debe seleccionar al menos un servicio' }),
});

const StepFourSchema = zod.object({
  date: zod.string().min(1, { message: 'Debe seleccionar una fecha' }),
  time: zod.string().min(1, { message: 'Debe seleccionar un horario' }),
});

const StepFiveSchema = zod.object({
  customer_name: zod.string().min(1, { message: 'Nombre es requerido' }),
  customer_phone: zod.string().min(1, { message: 'Teléfono es requerido' }),
  customer_email: zod.string().email().optional().or(zod.literal('')),
  notes: zod.string().optional(),
});

const WizardSchema = zod.object({
  stepOne: StepOneSchema,
  stepTwo: StepTwoSchema,
  stepThree: StepThreeSchema,
  stepFour: StepFourSchema,
  stepFive: StepFiveSchema,
});

const defaultValues = {
  stepOne: { branch_id: 0 },
  stepTwo: { barber_id: 0 },
  stepThree: { service_ids: [] },
  stepFour: { date: dayjs().format(), time: '' },
  stepFive: { customer_name: '', customer_phone: '', customer_email: '', notes: '' },
};

export function BookingWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [branches, setBranches] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(WizardSchema),
    defaultValues,
  });

  const {
    reset,
    trigger,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const selectedBranchId = watch('stepOne.branch_id');
  const selectedBarberId = watch('stepTwo.barber_id');
  const selectedDate = watch('stepFour.date');
  const selectedServiceIds = watch('stepThree.service_ids');

  useEffect(() => {
    setValue('stepFour.time', '');
  }, [selectedDate, selectedServiceIds, setValue]);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await publicBookingApi.getBranches();
        setBranches(response.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Error al cargar las sedes');
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId && activeStep >= 1) {
      const fetchBarbers = async () => {
        setLoadingBarbers(true);
        try {
          const response = await publicBookingApi.getBarbers(selectedBranchId);
          setBarbers(response.data || []);
        } catch (error) {
          console.error('Error fetching barbers:', error);
          toast.error('Error al cargar los barberos');
        } finally {
          setLoadingBarbers(false);
        }
      };
      fetchBarbers();
    }
  }, [selectedBranchId, activeStep]);

  useEffect(() => {
    if (selectedBranchId) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const response = await publicBookingApi.getServices(selectedBranchId);
          setServices(response.data || []);
        } catch (error) {
          console.error('Error fetching services:', error);
          toast.error('Error al cargar los servicios');
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
      setValue('stepThree.service_ids', []);
    }
  }, [selectedBranchId, setValue]);

  useEffect(() => {
    if (selectedBranchId && selectedBarberId && selectedDate && activeStep >= 2) {
      const fetchSchedules = async () => {
        setLoadingSchedules(true);
        try {
          const response = await publicBookingApi.getSchedules(selectedBranchId, selectedBarberId, selectedDate, selectedServiceIds || []);
          setSchedules(response.data || []);
        } catch (error) {
          console.error('Error fetching schedules:', error);
          toast.error('Error al cargar los horarios');
        } finally {
          setLoadingSchedules(false);
        }
      };
      fetchSchedules();
    }
  }, [selectedBranchId, selectedBarberId, selectedDate, selectedServiceIds, activeStep]);

  const handleNext = useCallback(
    async (step) => {
      if (step) {
        const isValid = await trigger(step);

        if (isValid) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [trigger]
  );

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setActiveStep(0);
    setAppointmentData(null);
  }, [reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const selectedDay = dayjs(data.stepFour.date);
      const startsAt = `${selectedDay.format('YYYY-MM-DD')}T${data.stepFour.time}:00${selectedDay.format('Z')}`;

      const appointmentPayload = {
        branch_id: data.stepOne.branch_id,
        customer_name: data.stepFive.customer_name,
        customer_phone: data.stepFive.customer_phone,
        customer_email: data.stepFive.customer_email || null,
        barber_id: data.stepTwo.barber_id,
        starts_at: startsAt,
        service_ids: data.stepThree.service_ids,
        notes: data.stepFive.notes || null,
      };

      const response = await publicBookingApi.createAppointment(appointmentPayload);
      setAppointmentData(response.data);
      toast.success('Reserva creada exitosamente!');
      handleNext();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  });

  const completedStep = activeStep === steps.length;

  return (
    <Card sx={{ p: { xs: 2, sm: 4, md: 5 }, width: 1, mx: 'auto', maxWidth: 800 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stepper steps={steps} activeStep={activeStep} />

        <Box
          gap={3}
          display="flex"
          flexDirection="column"
          sx={{
            p: { xs: 1.5, sm: 3 },
            mb: 3,
            minHeight: { xs: 220, sm: 300 },
            borderRadius: 1.5,
            border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          }}
        >
          {activeStep === 0 && (
            <StepOne 
              branches={branches} 
              loading={loadingBranches}
            />
          )}
          {activeStep === 1 && (
            <StepTwo 
              barbers={barbers} 
              loading={loadingBarbers}
            />
          )}
          {activeStep === 2 && (
            <StepServices 
              services={services} 
              loadingServices={loadingServices}
            />
          )}
          {activeStep === 3 && (
            <StepSchedule 
              schedules={schedules} 
              loading={loadingSchedules}
            />
          )}
          {activeStep === 4 && (
            <StepConfirm 
              branch={branches.find(b => b.id === selectedBranchId)}
              barber={barbers.find(b => b.id === selectedBarberId)}
              date={selectedDate}
              time={watch('stepFour.time')}
              services={services}
            />
          )}
          {completedStep && <StepCompleted appointmentData={appointmentData} onReset={handleReset} />}
        </Box>

        {!completedStep && (
          <Box display="flex">
            {activeStep !== 0 && <Button onClick={handleBack}>Atrás</Button>}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === 0 && (
              <Button variant="contained" onClick={() => handleNext('stepOne')}>
                Siguiente
              </Button>
            )}
            {activeStep === 1 && (
              <Button variant="contained" onClick={() => handleNext('stepTwo')}>
                Siguiente
              </Button>
            )}
            {activeStep === 2 && (
              <Button variant="contained" onClick={() => handleNext('stepThree')}>
                Siguiente
              </Button>
            )}
            {activeStep === 3 && (
              <Button variant="contained" onClick={() => handleNext('stepFour')}>
                Siguiente
              </Button>
            )}
            {activeStep === 4 && (
              <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                Confirmar Reserva
              </LoadingButton>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
}

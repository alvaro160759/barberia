import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import { publicBookingApi } from 'src/api/public-booking';

import { toast } from 'src/components/snackbar';

export const BOOKING_STEPS = [
  'Seleccionar Sede',
  'Seleccionar Barbero',
  'Seleccionar Servicios',
  'Seleccionar Horario',
  'Confirmar Reserva',
];

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
  customer_dni: zod.string().regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos').optional().or(zod.literal('')),
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

const defaultValues: BookingFormValues = {
  stepOne: { branch_id: 0 },
  stepTwo: { barber_id: 0 },
  stepThree: { service_ids: [] },
  stepFour: { date: dayjs().format(), time: '' },
  stepFive: { customer_dni: '', customer_name: '', customer_phone: '', customer_email: '', notes: '' },
};

export type BookingFormValues = zod.infer<typeof WizardSchema>;

export interface PublicBranch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface PublicBarber {
  id: number;
  first_name: string;
  last_name: string;
  photo_url?: string | null;
  avatar_url?: string | null;
  rating?: number | null;
  phone?: string;
}

export interface PublicService {
  id: number;
  name: string;
  price: number | string;
  duration_minutes: number | string;
}

export interface ScheduleSlot {
  time: string;
  available: boolean;
}

export interface CreatedAppointment {
  id: number | string;
  code?: string;
}

export function usePublicBooking() {
  const [activeStep, setActiveStep] = useState(0);
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appointmentData, setAppointmentData] = useState<CreatedAppointment | null>(null);

  const methods = useForm<BookingFormValues>({
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
  const selectedTime = watch('stepFour.time');

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
          const response = await publicBookingApi.getBarbers(selectedBranchId, selectedDate);
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
  }, [selectedBranchId, selectedDate, activeStep]);

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
          const response = await publicBookingApi.getSchedules(
            selectedBranchId,
            selectedBarberId,
            selectedDate,
            selectedServiceIds || []
          );
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
    async (step?: keyof BookingFormValues) => {
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
      setSubmitting(true);
      const selectedDay = dayjs(data.stepFour.date);
      const startsAt = `${selectedDay.format('YYYY-MM-DD')}T${data.stepFour.time}:00${selectedDay.format('Z')}`;

      const appointmentPayload = {
        branch_id: data.stepOne.branch_id,
        customer_name: data.stepFive.customer_name,
        customer_phone: data.stepFive.customer_phone,
        customer_email: data.stepFive.customer_email || null,
        customer_dni: data.stepFive.customer_dni ? data.stepFive.customer_dni.replace(/\D/g, '') : null,
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
      setSubmitting(false);
    }
  });

  const completedStep = activeStep === BOOKING_STEPS.length;

  return {
    methods,
    activeStep,
    completedStep,
    steps: BOOKING_STEPS,
    branches,
    barbers,
    services,
    schedules,
    loadingBranches,
    loadingBarbers,
    loadingServices,
    loadingSchedules,
    isSubmitting: isSubmitting || submitting,
    appointmentData,
    selectedBranchId,
    selectedBarberId,
    selectedDate,
    selectedTime,
    selectedServiceIds,
    selectedBranch: branches.find((branch) => Number(branch.id) === Number(selectedBranchId)),
    selectedBarber: barbers.find((barber) => Number(barber.id) === Number(selectedBarberId)),
    handleNext,
    handleBack,
    handleReset,
    onSubmit,
  };
}

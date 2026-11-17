import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form } from 'src/components/hook-form';

import { usePublicBooking } from 'src/hooks/use-public-booking';

import { BookingStepper } from './booking-stepper';
import { BranchStep } from './step-branch';
import { BarberStep } from './step-barber';
import { ServicesStep } from './step-services';
import { ScheduleStep } from './step-schedule';
import { ConfirmStep } from './step-confirm';
import { CompletedStep } from './step-completed';

export function BookingWizard() {
  const {
    methods,
    activeStep,
    completedStep,
    steps,
    branches,
    barbers,
    services,
    schedules,
    loadingBranches,
    loadingBarbers,
    loadingServices,
    loadingSchedules,
    isSubmitting,
    appointmentData,
    selectedBranch,
    selectedBarber,
    selectedDate,
    selectedTime,
    handleNext,
    handleBack,
    handleReset,
    onSubmit,
  } = usePublicBooking();

  return (
    <Card sx={{ p: { xs: 2, sm: 4, md: 5 }, width: 1, mx: 'auto', maxWidth: 800 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <BookingStepper steps={steps} activeStep={activeStep} />

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
          {activeStep === 0 && <BranchStep branches={branches} loading={loadingBranches} />}
          {activeStep === 1 && <BarberStep barbers={barbers} loading={loadingBarbers} />}
          {activeStep === 2 && <ServicesStep services={services} loading={loadingServices} />}
          {activeStep === 3 && <ScheduleStep schedules={schedules} loading={loadingSchedules} />}
          {activeStep === 4 && (
            <ConfirmStep
              branch={selectedBranch}
              barber={selectedBarber}
              date={selectedDate}
              time={selectedTime}
              services={services}
            />
          )}
          {completedStep && <CompletedStep appointmentData={appointmentData} onReset={handleReset} />}
        </Box>

        {!completedStep && (
          <Box display="flex">
            {activeStep !== 0 && <Button onClick={handleBack}>Atrás</Button>}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep < 4 && (
              <Button
                variant="contained"
                onClick={() => handleNext(`step${['One', 'Two', 'Three', 'Four'][activeStep]}`)}
              >
                Siguiente
              </Button>
            )}
            {activeStep === 4 && (
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Confirmar Reserva
              </LoadingButton>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
}

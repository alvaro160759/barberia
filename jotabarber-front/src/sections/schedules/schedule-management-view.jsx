import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';

import { useSchedules } from 'src/hooks/use-schedules';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TimeOffCard } from './time-off-card';
import { WeeklyScheduleCard } from './weekly-schedule-card';

export function ScheduleManagementView() {
  const {
    branches,
    selectedBranch,
    handleBranchChange,
    barbers,
    selectedBarberId,
    setSelectedBarberId,
    schedulesByWeekday,
    timeOff,
    slotInterval,
    SLOT_INTERVAL_OPTIONS,
    loadingBarbers,
    loadingSchedules,
    loadingTimeOff,
    savingSettings,
    replaceSchedule,
    clearSchedule,
    createTimeOff,
    deleteTimeOff,
    updateSlotInterval,
    barberName,
  } = useSchedules();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Horarios y Disponibilidad"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Horarios' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ mb: 2 }}
      >
        <TextField
          select
          size="small"
          label="Sede"
          value={selectedBranch}
          onChange={handleBranchChange}
          sx={{ minWidth: 220 }}
        >
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={String(branch.id)}>
              {branch.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack spacing={3}>
        <WeeklyScheduleCard
          barbers={barbers}
          selectedBarberId={selectedBarberId}
          onBarberChange={setSelectedBarberId}
          schedulesByWeekday={schedulesByWeekday}
          loading={loadingBarbers || loadingSchedules}
          onReplace={replaceSchedule}
          onClear={clearSchedule}
          slotInterval={slotInterval}
          intervalOptions={SLOT_INTERVAL_OPTIONS}
          savingInterval={savingSettings}
          onSaveInterval={updateSlotInterval}
        />

        <TimeOffCard
          barbers={barbers}
          timeOff={timeOff}
          loading={loadingBarbers || loadingTimeOff}
          onCreate={createTimeOff}
          onDelete={deleteTimeOff}
          barberName={barberName}
        />
      </Stack>
    </DashboardContent>
  );
}

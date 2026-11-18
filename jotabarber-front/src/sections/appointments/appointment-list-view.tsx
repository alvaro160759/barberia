import type { ChangeEvent } from 'react';

import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';
import { useAppointments } from 'src/hooks/use-appointments';

import { DashboardContent } from 'src/layouts/dashboard';

import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, TablePaginationCustom } from 'src/components/table';

import { AppointmentTable } from './appointment-table';
import { AppointmentFilters } from './appointment-filters';
import { AppointmentCalendar } from './appointment-calendar';
import { EMPTY_APPOINTMENT_FILTERS } from './appointments-constants';
import { AppointmentDetailDialog } from './appointment-detail-dialog';

import type { AppointmentFilters as AppointmentFiltersState } from './appointments-constants';

interface DateRange {
  from: string;
  to: string;
}

export function AppointmentListView() {
  const table = useTable();
  const tabs = useTabs('list');
  const [filters, setFilters] = useState<AppointmentFiltersState>(EMPTY_APPOINTMENT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AppointmentFiltersState>(EMPTY_APPOINTMENT_FILTERS);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const {
    rows,
    barbers,
    branches,
    selectedBranch,
    loading,
    detailOpen,
    detail,
    detailLoading,
    actionLoading,
    refresh,
    handleBranchChange,
    handleOpenDetail,
    handleCloseDetail,
    handleNextStatus,
  } = useAppointments(appliedFilters);

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  const handleFilterChange = (field: keyof AppointmentFiltersState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleBarberChange = (barberId: string | number) => {
    setFilters((prev) => ({ ...prev, barber_id: barberId }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_APPOINTMENT_FILTERS);
    setAppliedFilters(EMPTY_APPOINTMENT_FILTERS);
  };

  const handleApplyDateRange = ({ from, to }: DateRange) => {
    const next = { ...filters, from, to };
    setFilters(next);
    setAppliedFilters(next);
  };

  const notFound = !rows.length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Gestión de Citas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Gestión de Citas' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Tab value="list" label="Lista" />
        <Tab value="calendar" label="Calendario" />
      </Tabs>

      {tabs.value === 'calendar' ? (
        <>
          <Card sx={{ mb: { xs: 3, md: 5 } }}>
            <AppointmentFilters
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={handleBranchChange}
              barbers={barbers}
              filters={filters}
              onFilterChange={handleFilterChange}
              onBarberChange={handleBarberChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              onApplyDateRange={handleApplyDateRange}
              hasActiveFilters={hasActiveFilters}
              count={rows.length}
              onRefresh={() => {
                refresh();
                setCalendarRefreshKey((key) => key + 1);
              }}
            />
          </Card>

          <AppointmentCalendar
            selectedBranch={selectedBranch}
            filters={appliedFilters}
            refreshKey={calendarRefreshKey}
            onOpenDetail={handleOpenDetail}
          />
        </>
      ) : loading && rows.length === 0 ? (
        <SplashScreen />
      ) : (
        <Card>
          <AppointmentFilters
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={handleBranchChange}
            barbers={barbers}
            filters={filters}
            onFilterChange={handleFilterChange}
            onBarberChange={handleBarberChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onApplyDateRange={handleApplyDateRange}
            hasActiveFilters={hasActiveFilters}
            count={rows.length}
            onRefresh={refresh}
          />

          <AppointmentTable
            rows={rows}
            table={table}
            notFound={notFound}
            onOpenDetail={handleOpenDetail}
          />

          <TablePaginationCustom
            count={rows.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <AppointmentDetailDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        detail={detail}
        loading={detailLoading}
        actionLoading={actionLoading}
        onNextStatus={handleNextStatus}
      />
    </DashboardContent>
  );
}

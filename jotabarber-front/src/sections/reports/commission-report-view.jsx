import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

import { useCommissionReport } from 'src/hooks/useCommissionReport';

import { FilterCard } from './components/FilterCard';
import { KPIsGrid } from './components/KPIsGrid';
import { BarberTable } from './components/BarberTable';
import { ChartsSection } from './components/ChartsSection';
import { DetailDialog } from './components/DetailDialog';
import { SettleCommissionDialog } from './components/SettleCommissionDialog';

// ----------------------------------------------------------------------

export function CommissionReportView() {
  const {
    date,
    period,
    monthValue,
    yearValue,
    rangeFrom,
    rangeTo,
    dateRangeLabel,
    barberId,
    serviceId,
    branchId,
    barbers,
    services,
    branches,
    summary,
    byBarber,
    byServiceType,
    details,
    loading,
    detailDialogOpen,
    selectedBarber,
    setDate,
    setPeriod,
    setMonthValue,
    setYearValue,
    setRangeFrom,
    setRangeTo,
    setBarberId,
    setServiceId,
    setBranchId,
    handleViewDetail,
    handleCloseDetail,
    fetchReport,
  } = useCommissionReport();

  const [settleBarber, setSettleBarber] = useState(null);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Comisiones por Barbero"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Reportes', href: paths.dashboard.root },
          { name: 'Comisiones' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Iconify icon="eva:download-outline" />}>
            Exportar
          </Button>
        }
        sx={{ mb: { xs: 3, md: 2 } }}
      />

      <Stack spacing={3}>
        <FilterCard
          period={period}
          date={date}
          monthValue={monthValue}
          yearValue={yearValue}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          barberId={barberId}
          serviceId={serviceId}
          branchId={branchId}
          barbers={barbers}
          services={services}
          branches={branches}
          onPeriodChange={(e) => {
            const newPeriod = e.target.value;
            setPeriod(newPeriod);
            if (newPeriod === 'custom') {
              const [y, m] = date.split('-').map(Number);
              const first = new Date(y, m - 1, 1);
              const last = new Date(y, m, 0);
              const fmt = (d) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              setRangeFrom(fmt(first));
              setRangeTo(fmt(last));
            }
          }}
          onDateChange={(e) => setDate(e.target.value)}
          onMonthChange={(e) => setMonthValue(e.target.value)}
          onYearChange={(e) => setYearValue(e.target.value)}
          onRangeFromChange={(e) => setRangeFrom(e.target.value)}
          onRangeToChange={(e) => setRangeTo(e.target.value)}
          onBarberChange={(value) => setBarberId(value)}
          onServiceChange={(value) => setServiceId(value)}
          onBranchChange={(value) => setBranchId(value)}
          onFilter={fetchReport}
          dateRangeLabel={dateRangeLabel}
          onClear={() => {
            setPeriod('day');
            setBarberId('');
            setServiceId('');
            setBranchId('');
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            setDate(todayStr);
            setMonthValue(todayStr.slice(0, 7));
            setYearValue(String(today.getFullYear()));
            setRangeFrom(todayStr);
            setRangeTo(todayStr);
            fetchReport();
          }}
        />

        {loading ? (
          <SplashScreen />
        ) : (
          <>
            <KPIsGrid summary={summary} />
            <BarberTable byBarber={byBarber} summary={summary} onViewDetail={handleViewDetail} onSettle={setSettleBarber} />
            <ChartsSection byBarber={byBarber} byServiceType={byServiceType} />
          </>
        )}
      </Stack>

      <DetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        selectedBarber={selectedBarber}
        details={details}
      />

      <SettleCommissionDialog
        open={!!settleBarber}
        onClose={() => setSettleBarber(null)}
        barber={settleBarber}
        onPaid={fetchReport}
      />
    </DashboardContent>
  );
}

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

// ----------------------------------------------------------------------

export function CommissionReportView() {
  const {
    date,
    period,
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
    setBarberId,
    setServiceId,
    setBranchId,
    handleViewDetail,
    handleCloseDetail,
    fetchReport,
  } = useCommissionReport();

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
          barberId={barberId}
          serviceId={serviceId}
          branchId={branchId}
          barbers={barbers}
          services={services}
          branches={branches}
          onPeriodChange={(e) => setPeriod(e.target.value)}
          onDateChange={(e) => setDate(e.target.value)}
          onBarberChange={(value) => setBarberId(value)}
          onServiceChange={(value) => setServiceId(value)}
          onBranchChange={(value) => setBranchId(value)}
          onFilter={fetchReport}
        />

        {loading ? (
          <SplashScreen />
        ) : (
          <>
            <KPIsGrid summary={summary} />
            <BarberTable byBarber={byBarber} summary={summary} onViewDetail={handleViewDetail} />
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
    </DashboardContent>
  );
}

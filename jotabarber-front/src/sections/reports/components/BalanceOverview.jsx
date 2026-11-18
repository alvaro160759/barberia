import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

import { useTabs } from 'src/hooks/use-tabs';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { CustomTabs } from 'src/components/custom-tabs';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function BalanceOverview({ summary, incomeByDay = [], expenseByDay = [], sx, ...other }) {
  const theme = useTheme();
  const tabs = useTabs('income');

  const chartColors =
    tabs.value === 'income' ? [theme.palette.success.dark] : [theme.palette.error.dark];

  // Fechas unificadas y ordenadas
  const dateSet = new Set();
  incomeByDay.forEach((d) => dateSet.add(d.date));
  expenseByDay.forEach((d) => dateSet.add(d.date));
  const categories = Array.from(dateSet).sort();

  const buildSeries = (rows) => {
    const map = {};
    rows.forEach((d) => {
      map[d.date] = Number(d.total);
    });
    return categories.map((date) => map[date] || 0);
  };

  const incomeTotal = Number(summary?.total_income || 0);
  const expenseTotal = Number(summary?.total_expense || 0);
  const netTotal = Number(summary?.net || 0);

  const totalMovements = incomeTotal + expenseTotal;

  const TABS = [
    {
      value: 'income',
      label: 'Ingresos',
      total: incomeTotal,
      share: totalMovements > 0 ? (incomeTotal / totalMovements) * 100 : 0,
      icon: 'mingcute:arrow-up-circle-line',
      iconBg: 'success.darker',
      iconColor: 'success.lighter',
      chart: { series: [{ data: buildSeries(incomeByDay) }] },
    },
    {
      value: 'expenses',
      label: 'Egresos',
      total: expenseTotal,
      share: totalMovements > 0 ? (expenseTotal / totalMovements) * 100 : 0,
      icon: 'mingcute:arrow-down-circle-line',
      iconBg: 'error.darker',
      iconColor: 'error.lighter',
      chart: { series: [{ data: buildSeries(expenseByDay) }] },
    },
  ];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories,
      labels: {
        formatter: (value) => {
          const parts = String(value).split('-');
          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
        },
      },
    },
    stroke: { width: 3 },
    tooltip: {
      y: { formatter: (value) => fCurrency(value).replace('$', 'S/.'), title: { formatter: () => '' } },
    },
  });

  const renderBalance = (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h3" sx={{ color: 'text.secondary' }}>
          Total balance
        </Typography>
        <Tooltip title="Ingresos menos egresos del período seleccionado">
          <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
        </Tooltip> 
        <Typography variant="h3" sx={{ color: netTotal >= 0 ? 'success.main' : 'error.main' }}>
          {fCurrency(netTotal).replace('$', 'S/.')}
        </Typography>
      </Box>
    </Box>
  );

  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      sx={{ my: 3, borderRadius: 2 }}
      slotProps={{
        indicator: { borderRadius: 1.5, boxShadow: theme.customShadows.z4 },
        tab: { p: 3 },
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            <Box
              sx={{
                width: 1,
                display: 'flex',
                gap: { xs: 1, md: 2.5 },
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: '50%',
                  alignItems: 'center',
                  color: tab.iconColor,
                  justifyContent: 'center',
                  bgcolor: tab.iconBg,
                  display: { xs: 'none', md: 'inline-flex' },
                }}
              >
                <Iconify width={24} icon={tab.icon} />
              </Box>

              <div>
                <Box
                  sx={{
                    mb: 0.5,
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    typography: 'subtitle2',
                  }}
                >
                  {tab.label}
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {tab.share.toFixed(1)}%
                  </Typography>
                </Box>

                <Box sx={{ typography: 'h4' }}>{fCurrency(tab.total).replace('$', 'S/.')}</Box>
              </div>
            </Box>
          }
        />
      ))}
    </CustomTabs>
  );

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      {renderBalance}
      {renderTabs}

      {categories.length > 0 ? (
        <Chart
          type="line"
          series={tabs.value === 'income' ? TABS[0].chart.series : TABS[1].chart.series}
          options={chartOptions}
          height={270}
        />
      ) : (
        <Box sx={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Sin datos para el período seleccionado
        </Box>
      )}
    </Card>
  );
}

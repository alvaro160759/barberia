import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { SplashScreen } from 'src/components/loading-screen';
import { Chart, useChart } from 'src/components/chart';
import { KPIWidget } from './components/KPIWidget';
import { BalanceOverview } from './components/BalanceOverview';

import { useBranches } from 'src/hooks/use-branches';
import axios, { endpoints } from 'src/utils/axios';

export function IncomeExpenseReportView() {
  const settings = useSettingsContext();
  const { branches, fetchBranches } = useBranches();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filtros
  const formatDateLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const today = formatDateLocal(new Date());
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(today);
  const [monthValue, setMonthValue] = useState(today.slice(0, 7));
  const [yearValue, setYearValue] = useState(String(new Date().getFullYear()));
  const [rangeFrom, setRangeFrom] = useState(today);
  const [rangeTo, setRangeTo] = useState(today);
  const [filterBranch, setFilterBranch] = useState(null);

  const parseLocalDate = (value) => {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getRange = () => {
    switch (period) {
      case 'day':
        return [date, date];
      case 'month': {
        const [y, m] = monthValue.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const last = new Date(y, m, 0);
        return [formatDateLocal(first), formatDateLocal(last)];
      }
      case 'year': {
        const y = Number(yearValue);
        const first = new Date(y, 0, 1);
        const last = new Date(y, 11, 31);
        return [formatDateLocal(first), formatDateLocal(last)];
      }
      case 'custom':
      default:
        return [rangeFrom, rangeTo];
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [from, to] = getRange();
      const params = { from, to };
      if (filterBranch?.id) params.branch_id = filterBranch.id;

      const res = await axios.get(endpoints.incomeExpenseReport, { params });
      setData(res?.data?.data || res?.data || null);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, date, monthValue, yearValue, rangeFrom, rangeTo, filterBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

  // Preparar datos para gráfico ingresos/egresos por día
  const incomeByDayMap = {};
  const expenseByDayMap = {};
  const allDates = new Set();

  (data?.income_by_day || []).forEach((d) => {
    incomeByDayMap[d.date] = Number(d.total);
    allDates.add(d.date);
  });
  (data?.expense_by_day || []).forEach((d) => {
    expenseByDayMap[d.date] = Number(d.total);
    allDates.add(d.date);
  });
  const sortedDates = Array.from(allDates).sort();

  const dailyChartOptions = useChart({
    xaxis: { categories: sortedDates },
    stroke: { width: [3, 0], curve: 'smooth' },
    plotOptions: { bar: { columnWidth: '40%' } },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'bottom' },
    tooltip: {
      y: { formatter: (value) => `S/ ${Number(value).toFixed(2)}` },
    },
  });

  const dailySeries = [
    {
      name: 'Ingresos',
      type: 'line',
      data: sortedDates.map((date) => incomeByDayMap[date] || 0),
    },
    {
      name: 'Egresos',
      type: 'column',
      data: sortedDates.map((date) => expenseByDayMap[date] || 0),
    },
  ];

  // Gráfico ingresos por método de pago (donut)
  const incomeMethodLabels = (data?.income_by_method || []).map((m) => m.method);
  const incomeMethodSeries = (data?.income_by_method || []).map((m) => Number(m.total));

  const incomeMethodChartOptions = useChart({
    labels: incomeMethodLabels,
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: { show: true },
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => formatCurrency(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    legend: { show: true, position: 'bottom' },
    tooltip: { y: { formatter: (value) => `S/ ${Number(value).toFixed(2)}` } },
    dataLabels: { enabled: true },
  });

  // Gráfico egresos por categoría (donut)
  const expenseCategoryLabels = (data?.expense_by_category || []).map((c) => c.category);
  const expenseCategorySeries = (data?.expense_by_category || []).map((c) => Number(c.total));

  const expenseCategoryChartOptions = useChart({
    labels: expenseCategoryLabels,
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: { show: true },
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => formatCurrency(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    legend: { show: true, position: 'bottom' },
    tooltip: { y: { formatter: (value) => `S/ ${Number(value).toFixed(2)}` } },
    dataLabels: { enabled: true },
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Reporte Ingresos y Egresos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Reportes', href: '#' },
          { name: 'Ingresos y Egresos' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <Stack spacing={2} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Periodo"
                size="small"
                value={period}
                onChange={(e) => {
                  const newPeriod = e.target.value;
                  setPeriod(newPeriod);
                  if (newPeriod === 'custom') {
                    const base = parseLocalDate(date);
                    const first = new Date(base.getFullYear(), base.getMonth(), 1);
                    const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
                    setRangeFrom(formatDateLocal(first));
                    setRangeTo(formatDateLocal(last));
                  }
                }}
                fullWidth
              >
                <MenuItem value="day">Día</MenuItem>
                <MenuItem value="month">Mes</MenuItem>
                <MenuItem value="year">Año</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </TextField>
            </Grid>
            {period === 'day' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Fecha"
                  type="date"
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            )}
            {period === 'month' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Mes"
                  type="month"
                  size="small"
                  value={monthValue}
                  onChange={(e) => setMonthValue(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            )}
            {period === 'year' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Año"
                  type="number"
                  size="small"
                  value={yearValue}
                  onChange={(e) => setYearValue(e.target.value)}
                  inputProps={{ min: 2020, max: 2100 }}
                  fullWidth
                />
              </Grid>
            )}
            {period === 'custom' && (
              <>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={period === 'custom' ? 6 : 3}>
              <Autocomplete
                options={branches}
                getOptionLabel={(option) => option.name || ''}
                value={filterBranch}
                onChange={(e, newValue) => setFilterBranch(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Sucursal" size="small" />
                )}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            onClick={() => {
              setPeriod('day');
              setDate(today);
              setMonthValue(today.slice(0, 7));
              setYearValue(String(new Date().getFullYear()));
              setRangeFrom(today);
              setRangeTo(today);
              setFilterBranch(null);
            }}
          >
            Limpiar Filtros
          </Button>
        </Stack>
      </Card>

      {loading ? (
        <SplashScreen />
      ) : data ? (
        <Stack spacing={3}>
          {/* Total balance con tabs Ingresos/Egresos */}
          

          {/* Cards de Resumen */}
          <Grid container spacing={3}>

            <Grid item xs={6}>
            <BalanceOverview
              summary={data.summary}
              incomeByDay={data.income_by_day}
              expenseByDay={data.expense_by_day}
            />
            </Grid>

            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Ingresos por Método de Pago</Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {incomeMethodSeries.length > 0 ? (
                    <Chart type="donut" series={incomeMethodSeries} options={incomeMethodChartOptions} height={340} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">Sin ingresos registrados</Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Gráfico Egresos por Categoría */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Egresos por Categoría</Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {expenseCategorySeries.length > 0 ? (
                    <Chart type="donut" series={expenseCategorySeries} options={expenseCategoryChartOptions} height={340} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">Sin egresos registrados</Typography>
                  )}
                </Box>
              </Card>
            </Grid>

          </Grid>

          <Grid container spacing={3}>
            {/* Últimas Ventas */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter', color: 'primary.main' }}>
                    <Iconify icon="mingcute:shopping-bag-3-line" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Últimas Ventas</Typography>
                    <Typography variant="caption" color="text.secondary">{data.latest_sales?.length || 0} registros</Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 380 }}>
                  {data.latest_sales?.length > 0 ? (
                    <Stack divider={<Divider flexItem />}>
                      {data.latest_sales.map((sale) => (
                        <Box key={sale.id} sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>#{sale.number}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {sale.customer_name || 'Cliente general'} · {formatDate(sale.sold_at)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ flexShrink: 0 }}>
                            {formatCurrency(sale.total_amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin ventas</Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Últimos Egresos */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.lighter', color: 'error.main' }}>
                    <Iconify icon="mingcute:arrow-up-circle-line" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Últimos Egresos</Typography>
                    <Typography variant="caption" color="text.secondary">{data.latest_expenses?.length || 0} registros</Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 380 }}>
                  {data.latest_expenses?.length > 0 ? (
                    <Stack divider={<Divider flexItem />}>
                      {data.latest_expenses.map((expense) => (
                        <Box key={expense.id} sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>{expense.category_name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {expense.description} · {formatDate(expense.spent_at)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="error.main" fontWeight={700} sx={{ flexShrink: 0 }}>
                            {formatCurrency(expense.amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin egresos</Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Servicios más vendidos */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'warning.lighter', color: 'warning.dark' }}>
                    <Iconify icon="mingcute:scissors-line" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Servicios más vendidos</Typography>
                    <Typography variant="caption" color="text.secondary">Top {data.top_services?.length || 0}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 380 }}>
                  {data.top_services?.length > 0 ? (
                    <Stack divider={<Divider flexItem />}>
                      {data.top_services.map((service, index) => (
                        <Box key={service.service_name} sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <Chip
                              label={index + 1}
                              size="small"
                              color={index === 0 ? 'warning' : 'default'}
                              sx={{ fontWeight: 700, minWidth: 32 }}
                            />
                            <Typography variant="body2" fontWeight={600} noWrap>{service.service_name}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography variant="body2" color="primary.main" fontWeight={700}>
                              {service.quantity} uds
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(service.total)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin servicios vendidos</Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Top Barberos */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'info.lighter', color: 'info.main' }}>
                    <Iconify icon="mingcute:user-2-line" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Top Barberos</Typography>
                    <Typography variant="caption" color="text.secondary">{data.top_barbers?.length || 0} barberos</Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 380 }}>
                  {data.top_barbers?.length > 0 ? (
                    <Stack divider={<Divider flexItem />}>
                      {data.top_barbers.map((barber, index) => (
                        <Box key={barber.barber_id} sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: index === 0 ? 'warning.main' : 'action.selected', color: index === 0 ? 'warning.contrastText' : 'text.primary' }}>
                              {barber.barber_name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} noWrap>{barber.barber_name}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography variant="body2" color="primary.main" fontWeight={700}>
                              {barber.services_count} serv.
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(barber.total)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin barberos con ventas</Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      ) : (
        <Typography>No hay datos disponibles</Typography>
      )}
    </Container>
  );
}

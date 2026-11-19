import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { AppWelcome } from '../app-welcome';
import { AppWidgetSummary } from '../app-widget-summary';

import { appointmentsApi } from 'src/actions/appointments';
import { salesApi } from 'src/actions/sales';

// ----------------------------------------------------------------------

const formatDateLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const extractRows = (res) => {
  const data = res?.data?.data?.data || res?.data?.data || res?.data || [];
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

const percentChange = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

export function OverviewAppView() {
  const theme = useTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = formatDateLocal(new Date());
        const from14 = new Date();
        from14.setDate(from14.getDate() - 13);
        const from = formatDateLocal(from14);

        const [salesRes, appointmentsRes] = await Promise.all([
          salesApi.getAll({ from, to: today, status: 'CONFIRMED', per_page: 200 }),
          appointmentsApi.getAppointments({ from, to: today, per_page: 200 }),
        ]);

        const sales = extractRows(salesRes);
        const appointments = extractRows(appointmentsRes);

        // Últimos 7 días y 7 días previos
        const last7 = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          last7.push(formatDateLocal(d));
        }
        const prev7 = last7.map((date) => {
          const d = new Date(`${date}T00:00:00`);
          d.setDate(d.getDate() - 7);
          return formatDateLocal(d);
        });
        const allDays = [...prev7, ...last7];

        const appointmentsByDay = {};
        appointments.forEach((a) => {
          const day = (a.starts_local || a.starts_at || '').slice(0, 10);
          appointmentsByDay[day] = (appointmentsByDay[day] || 0) + 1;
        });

        const servicesByDay = {};
        const moneyByDay = {};
        sales.forEach((s) => {
          const day = (s.sold_at || '').slice(0, 10);
          servicesByDay[day] = (servicesByDay[day] || 0) + Number(s.services_count || 0);
          moneyByDay[day] = (moneyByDay[day] || 0) + Number(s.total_amount || 0);
        });

        const sumByDay = (map, days) => days.map((day) => map[day] || 0);
        const sumRange = (map, days) => days.reduce((acc, day) => acc + (map[day] || 0), 0);

        const todayKey = today;
        setStats({
          appointmentsToday: appointmentsByDay[todayKey] || 0,
          appointmentsSeries: sumByDay(appointmentsByDay, last7),
          appointmentsPrev: sumRange(appointmentsByDay, prev7),
          appointmentsLast7: sumRange(appointmentsByDay, last7),
          servicesToday: servicesByDay[todayKey] || 0,
          servicesSeries: sumByDay(servicesByDay, last7),
          servicesPrev: sumRange(servicesByDay, prev7),
          servicesLast7: sumRange(servicesByDay, last7),
          moneyToday: moneyByDay[todayKey] || 0,
          moneySeries: sumByDay(moneyByDay, last7),
          moneyPrev: sumRange(moneyByDay, prev7),
          moneyLast7: sumRange(moneyByDay, last7),
        });
      } catch (error) {
        console.error('Error loading overview stats:', error);
      }
    };

    loadStats();
  }, []);

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartCategories = last7Dates.map((d) => dayLabels[d.getDay()]);

  const s = stats || {};

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title="Bienvenido de nuevo 👋"
            description="Estás en el panel de administración de Jota Barber."
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Reservas hoy"
            percent={percentChange(s.appointmentsLast7 || 0, s.appointmentsPrev || 0)}
            total={s.appointmentsToday || 0}
            chart={{
              categories: chartCategories,
              series: s.appointmentsSeries || Array(7).fill(0),
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Servicios hoy"
            percent={percentChange(s.servicesLast7 || 0, s.servicesPrev || 0)}
            total={s.servicesToday || 0}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: chartCategories,
              series: s.servicesSeries || Array(7).fill(0),
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Ventas hoy (S/)"
            percent={percentChange(s.moneyLast7 || 0, s.moneyPrev || 0)}
            total={Number((s.moneyToday || 0).toFixed(2))}
            chart={{
              colors: [theme.vars.palette.success.main],
              categories: chartCategories,
              series: (s.moneySeries || Array(7).fill(0)).map((v) => Number(v.toFixed(2))),
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

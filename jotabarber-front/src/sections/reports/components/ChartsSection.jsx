import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Chart, useChart } from 'src/components/chart';

export function ChartsSection({ byBarber, byServiceType }) {
  const barChartSeries = byBarber.map((b) => Number(b.barber_earned));
  const barChartLabels = byBarber.map((b) => `${b.first_name} ${b.last_name}`);
  const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A', '#D10CE8'];
  const barChartOptions = useChart({
    xaxis: { categories: barChartLabels },
    tooltip: { y: { formatter: (value) => `S/ ${value}` } },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `S/ ${value}`,
      position: 'top',
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#000'],
        fontWeight: 600,
      },
    },
    colors: colors.slice(0, byBarber.length),
  });

  const pieChartSeries = byServiceType.map((s) => Number(s.count));
  const pieChartLabels = byServiceType.map((s) => s.name);
  const pieColors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A', '#D10CE8'];
  const pieChartOptions = useChart({
    labels: pieChartLabels,
    tooltip: { y: { formatter: (value) => `${value} servicios` } },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '12px',
              formatter: (value) => `${value} servicios`,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)} servicios`,
            },
          },
        },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      offset: -10,
      formatter: (val, opts) => {
        const service = byServiceType[opts.seriesIndex];
        return `${service.name}`;
      },
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#000'],
      },
    },
    colors: pieColors.slice(0, byServiceType.length),
  });

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Card sx={{ flex: 1, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comisiones por Barbero
        </Typography>
        <Chart
          type="bar"
          series={[{ data: barChartSeries }]}
          options={barChartOptions}
          height={300}
        />
      </Card>

      <Card sx={{ flex: 1, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Distribución de Servicios
        </Typography>
        <Chart
          type="donut"
          series={pieChartSeries}
          options={pieChartOptions}
          height={350}
        />
      </Card>
    </Stack>
  );
}

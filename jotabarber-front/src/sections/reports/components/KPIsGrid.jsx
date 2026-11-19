import { Grid } from '@mui/material';
import { KPIWidget } from './KPIWidget';

export function KPIsGrid({ summary }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Ingresos"
          value={`S/ ${summary?.total_sales || '0.00'}`}
          icon="mingcute:wallet-2-line"
          color="success"
        />
      </Grid>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Total de comisiones"
          value={`S/ ${summary?.total_commissions || '0.00'}`}
          icon="mingcute:cash-line"
          color="warning"
        />
      </Grid>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Comisiones pagadas"
          value={`S/ ${summary?.total_paid || '0.00'}`}
          icon="mingcute:check-circle-line"
          color="success"
        />
      </Grid>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Comisiones pendientes"
          value={`S/ ${summary?.total_pending || '0.00'}`}
          icon="mingcute:time-line"
          color="error"
        />
      </Grid>
    </Grid>
  );
}

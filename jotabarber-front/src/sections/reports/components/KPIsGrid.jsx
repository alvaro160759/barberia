import { Grid } from '@mui/material';
import { KPIWidget } from './KPIWidget';

export function KPIsGrid({ summary }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Servicios realizados"
          total={summary?.services_count || 0}
          icon="mingcute:scissors-line"
          color="info"
        />
      </Grid>
      <Grid item xs={12} lg={3}>
        <KPIWidget
          title="Clientes atendidos"
          total={summary?.clients_count || 0}
          icon="mingcute:user-2-line"
          color="primary"
        />
      </Grid>
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
    </Grid>
  );
}

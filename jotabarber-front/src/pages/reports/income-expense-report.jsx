import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { IncomeExpenseReportView } from 'src/sections/reports/income-expense-report-view';

// ----------------------------------------------------------------------

const metadata = { title: `Reporte Ingresos y Egresos - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <IncomeExpenseReportView />
    </>
  );
}

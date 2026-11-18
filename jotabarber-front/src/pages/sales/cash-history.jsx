import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CashHistoryView } from 'src/sections/sales/cash-history-view';

// ----------------------------------------------------------------------

const metadata = { title: `Historial de Caja - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CashHistoryView />
    </>
  );
}

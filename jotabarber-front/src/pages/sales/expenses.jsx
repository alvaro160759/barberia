import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ExpensesView } from 'src/sections/sales/expenses-view';

// ----------------------------------------------------------------------

const metadata = { title: `Gestión de Egresos - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ExpensesView />
    </>
  );
}

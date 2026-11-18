import { Helmet } from "react-helmet-async";

import { CONFIG } from "src/config-global";

import { SalesListView } from "src/sections/sales/sales-list-view";

const metadata = { title: `Gestión de servicios - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SalesListView />
    </>
  );
}

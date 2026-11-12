import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MenuListView } from 'src/sections/maintenance/menus/menu-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Menús - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MenuListView />
    </>
  );
}

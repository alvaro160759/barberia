import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PermissionListView } from 'src/sections/maintenance/permissions/permission-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Permisos - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PermissionListView />
    </>
  );
}

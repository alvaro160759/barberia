import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RoleCreateView } from 'src/sections/maintenance/roles/role-create-view';

// ----------------------------------------------------------------------

const metadata = { title: `Nuevo Rol - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RoleCreateView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RoleEditView } from 'src/sections/maintenance/roles/role-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Editar Rol - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RoleEditView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserEditView } from 'src/sections/maintenance/users/user-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Editar Usuario - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserEditView />
    </>
  );
}

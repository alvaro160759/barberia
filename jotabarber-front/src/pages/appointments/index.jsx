import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AppointmentListView } from 'src/sections/appointments/appointment-list-view';

const metadata = { title: `Gestión de Citas | ${CONFIG.site.name}` };

export default function AppointmentsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AppointmentListView />
    </>
  );
}

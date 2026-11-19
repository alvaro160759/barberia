import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ScheduleManagementView } from 'src/sections/schedules/schedule-management-view';

const metadata = { title: `Horarios y Disponibilidad | ${CONFIG.site.name}` };

export default function SchedulesPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ScheduleManagementView />
    </>
  );
}

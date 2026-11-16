import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BookingWizard } from 'src/sections/public-booking';

const metadata = { title: `Reserva Pública | ${CONFIG.site.name}` };

export default function PublicBookingPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BookingWizard />
    </>
  );
}

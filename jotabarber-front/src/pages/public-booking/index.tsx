import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';

import { CONFIG } from 'src/config-global';

import { BookingWizard } from 'src/sections/public-booking';

const metadata = { title: `Reserva Pública | ${CONFIG.site.name}` };

export default function PublicBookingPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          py: { xs: 3, md: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <BookingWizard />
      </Box>
    </>
  );
}

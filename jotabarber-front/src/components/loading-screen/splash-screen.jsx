import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';

import { CONFIG } from 'src/config-global';

import { AnimateLogo1 } from 'src/components/animate';

// ----------------------------------------------------------------------

export function SplashScreen({ portal = true, sx, ...other }) {
  const content = (
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          right: 0,
          width: 1,
          bottom: 0,
          height: 1,
          zIndex: 9998,
          display: 'flex',
          position: 'fixed',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          ...sx,
        }}
        {...other}
      >
        <AnimateLogo1
          logo={
            <Box
              component="img"
              src={`${CONFIG.site.basePath}/logo/logo-jota.png`}
              alt="Jota Barber Logo"
              sx={{ width: 80, height: 80, objectFit: 'contain' }}
            />
          }
        />
      </Box>
    </Box>
  );

  if (portal) {
    return <Portal>{content}</Portal>;
  }

  return content;
}

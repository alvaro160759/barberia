import { memo } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';

import { BackgroundShape } from './background-shape';

// ----------------------------------------------------------------------

function SeoIllustration({ hideBackground, sx, ...other }) {
  const theme = useTheme();

  return (
    <Box
      component="svg"
      width="100%"
      height="100%"
      viewBox="0 0 700 300"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: 320, maxWidth: 1, flexShrink: 0, height: 'auto', ...sx }}
      {...other}
    >
      {!hideBackground && <BackgroundShape />}

      <image
        href={`${CONFIG.site.basePath}/assets/illustrations/characters/barbero-2.png`}
        height="305"
        x="250"
        y="0"
      />
    </Box>
  );
}

export default memo(SeoIllustration);

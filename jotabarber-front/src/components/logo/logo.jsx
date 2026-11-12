import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

import { logoClasses } from './classes';


// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ width = 200, height = 50, disableLink = false, className, href = '/', sx, isMini = false, ...other }, ref) => {
    
     // OR using local (public folder)
      const logo = isMini
        ? ( <Box alt="logo mini" component="img" src={`${CONFIG.site.basePath}/logo/logo-jota.png`} width={width} height={height} sx={{ objectFit: 'contain' }} /> )
        : ( <Box alt="logo" component="img" src={`${CONFIG.site.basePath}/logo/logo-jota-extendido.png`} width={width} height={height} /> );

    return (
      <NoSsr
        fallback={
          <Box
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              ...sx,
            }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          width={width}
          height={height}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {logo}
        </Box>
      </NoSsr>
    );
  }
);

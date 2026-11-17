import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export function StepLoadingSkeleton() {
  return (
    <Grid container spacing={2}>
      {[0, 1, 2, 3].map((index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Skeleton variant="rounded" height={96} />
        </Grid>
      ))}
    </Grid>
  );
}

export function StepLayout({ title, icon, loading = false, empty = false, emptyMessage, error, children }) {
  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        {icon && <Iconify icon={icon} width={22} sx={{ mr: 1, color: 'text.secondary' }} />}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {loading ? (
        <StepLoadingSkeleton />
      ) : empty ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ py: 6, borderRadius: 1.5, border: (theme) => `dashed 1px ${theme.vars.palette.divider}` }}
        >
          <Iconify icon="solar:inbox-linear" width={48} sx={{ color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        children
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

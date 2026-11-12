import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function UserTableFiltersResult({ filters, totalResults, onResetPage, sx }) {
  return (
    <Stack spacing={1.5} alignItems="center" flexDirection="row" sx={sx}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        <span>{totalResults}</span> resultados encontrados
      </Typography>

      {filters.state.name && (
        <Stack spacing={1} direction="row" alignItems="center">
          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:close-circle-bold" />}
            onClick={() => {
              onResetPage();
              filters.setState({ name: '' });
            }}
          >
            {filters.state.name}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

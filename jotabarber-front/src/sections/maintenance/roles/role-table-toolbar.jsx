import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RoleTableToolbar({ filters, onResetPage }) {
  return (
    <Box
      sx={{
        py: 2.5,
        px: 3,
        borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      <TextField
        fullWidth
        value={filters.state.name}
        onChange={(event) => {
          onResetPage();
          filters.setState({ name: event.target.value });
        }}
        placeholder="Buscar rol..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Unstable_Grid2';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProductTableToolbar({ onBranchChange, branches, selectedBranch, filters, onResetPage }) {
  return (
    <Box sx={{ p: 2.5, pt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            label="Sucursal"
            size="small"
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
          >
            <MenuItem value="">Todas las sucursales</MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={8} md={9}>
          <TextField
            fullWidth
            value={filters.state.name}
            size="small"
            onChange={(event) => {
              onResetPage();
              filters.setState({ name: event.target.value });
            }}
            placeholder="Buscar producto..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

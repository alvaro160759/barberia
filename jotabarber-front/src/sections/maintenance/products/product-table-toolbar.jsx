import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useRouter } from 'src/routes/hooks';


export function ProductTableToolbar({ onBranchChange, branches, selectedBranch }) {
  const router = useRouter();

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pt: 2 }}
    >
      <TextField
        select
        label="Sucursal"
        size='small'
        value={selectedBranch}
        onChange={(e) => onBranchChange(e.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">Todas las sucursales</MenuItem>
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

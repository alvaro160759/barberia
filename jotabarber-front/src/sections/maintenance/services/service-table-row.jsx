import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export function ServiceTableRow({ row, selected, onSelectRow, onEditRow, onDeleteRow }) {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2">
            {row.name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{row.price ? `S/ ${row.price}` : '-'}</TableCell>

      <TableCell>{row.commission_percentage ? `${row.commission_percentage}%` : '0%'}</TableCell>

      <TableCell>
        <Label
          variant={row.active ? 'filled' : 'soft'}
          color={row.active ? 'success' : 'error'}
        >
          {row.active ? 'Activo' : 'Inactivo'}
        </Label>
      </TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton onClick={onEditRow}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton onClick={onDeleteRow} color="error">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

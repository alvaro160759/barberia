import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

export function ProductTableRow({ row, onEditRow, onDeleteRow }) {
  return (
    <TableRow hover>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.category_name || '-'}</TableCell>
      <TableCell>{row.price || '0.00'}</TableCell>
      <TableCell>{row.stock || '0'}</TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={row.active ? 'success' : 'error'}
        >
          {row.active ? 'Activo' : 'Inactivo'}
        </Label>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1}>
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

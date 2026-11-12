import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

export function EmployeeTableRow({ row, onEditRow, onDeleteRow }) {
  return (
    <TableRow hover>
      <TableCell>{row.document_number || '-'}</TableCell>
      <TableCell>{row.first_name}</TableCell>
      <TableCell>{row.last_name}</TableCell>
      <TableCell>{row.job_type}</TableCell>
      <TableCell>{row.phone}</TableCell>
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

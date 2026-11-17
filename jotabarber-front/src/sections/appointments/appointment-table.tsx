import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';

import { formatAppointmentDate } from './appointments-constants';
import { AppointmentStatusChip } from './appointment-status-chip';

import type { AppointmentRow } from './appointments-constants';

interface TableState {
  page: number;
  rowsPerPage: number;
}

interface AppointmentTableProps {
  rows: AppointmentRow[];
  table: TableState;
  notFound: boolean;
  onOpenDetail: (id: number) => void;
}

export function AppointmentTable({ rows, table, notFound, onOpenDetail }: AppointmentTableProps) {
  const pagedRows = rows.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage);

  return (
    <Scrollbar>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Barbero</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onOpenDetail(row.id)}
              >
                <TableCell>{formatAppointmentDate(row.starts_local).split(' ')[0]}</TableCell>
                <TableCell>{row.starts_local?.split(' ')[1]} – {row.ends_local}</TableCell>
                <TableCell>
                  {row.customer_first_name} {row.customer_last_name}
                </TableCell>
                <TableCell>{row.customer_phone || '-'}</TableCell>
                <TableCell>
                  {row.barber_first_name} {row.barber_last_name}
                </TableCell>
                <TableCell>
                  <AppointmentStatusChip status={row.status} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onOpenDetail(row.id)}>
                    <Iconify icon="solar:eye-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}

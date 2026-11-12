import { useState, useEffect,useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { accessApi } from 'src/actions/access';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'Código' },
  { id: 'label', label: 'Etiqueta' },
  { id: 'route', label: 'Ruta' },
  { id: 'icon', label: 'Icono' },
  { id: 'sort_order', label: 'Orden' },
  { id: 'active', label: 'Activo' },
];

// ----------------------------------------------------------------------

export function MenuListView() {
  const table = useTable();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const dataFiltered = Array.isArray(tableData) ? tableData : [];

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accessApi.getMenus();
      // Manejar diferentes estructuras de respuesta
      const data = response.data?.data || response.data || [];
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Menús"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento' },
          { name: 'Menús' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              onSort={table.onSort}
            />

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length} align="center">
                    <Typography sx={{ py: 3 }}>Cargando...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.route || '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.icon && <Iconify icon={row.icon} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.sort_order}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.active ? 'Sí' : 'No'}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

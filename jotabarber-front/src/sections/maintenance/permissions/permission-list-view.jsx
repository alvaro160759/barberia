import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { usePermissions } from 'src/hooks/use-permissions';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'Código' },
  { id: 'name', label: 'Nombre' },
  { id: 'module', label: 'Módulo' },
];

// ----------------------------------------------------------------------

export function PermissionListView() {
  const table = useTable();

  const { permissions, loading, fetchPermissions } = usePermissions();

  const [tableData, setTableData] = useState([]);

  const dataFiltered = Array.isArray(tableData) ? tableData : [];

  useEffect(() => {
    const loadData = async () => {
      await fetchPermissions();
    };
    loadData();
  }, [fetchPermissions]);

  useEffect(() => {
    setTableData(permissions);
  }, [permissions]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Permisos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento' },
          { name: 'Permisos' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <SplashScreen />
      ) : (
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
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                          }}
                        >
                          <Iconify icon="eva:folder-fill" sx={{ mr: 0.5, width: 16, height: 16 }} />
                          {row.module}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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
      )}
    </DashboardContent>
  );
}

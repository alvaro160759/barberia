import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import { Button, Table, TableBody, TableContainer } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCustomers } from 'src/hooks/use-customers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  TableNoData,
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { CustomerTableRow } from './customer-table-row';
import { CustomerTableToolbar } from './customer-table-toolbar';

const TABLE_HEAD = [
  { id: 'first_name', label: 'Nombre' },
  { id: 'last_name', label: 'Apellido' },
  { id: 'phone', label: 'Teléfono' },
  { id: 'email', label: 'Email' },
  { id: 'active', label: 'Estado', width: 80 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function CustomerListView() {
  const router = useRouter();
  const table = useTable();
  const confirm = useBoolean();
  const { customers, loading, fetchCustomers, deleteCustomer } = useCustomers();
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchCustomers();
    };
    loadData();
  }, [fetchCustomers]);

  useEffect(() => {
    setTableData(customers);
  }, [customers]);

  const handleDeleteRow = async (id) => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const dataFiltered = tableData;
  const notFound = !dataFiltered.length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Clientes"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Clientes' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.maintenance.customers.new)}
          >
            Nuevo Cliente
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <SplashScreen />
      ) : (
        <Card>
          <CustomerTableToolbar onRefresh={fetchCustomers} />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage).map((row, index) => (
                    <CustomerTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEditRow={() => router.push(paths.dashboard.maintenance.customers.edit(row.id))}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePaginationCustom
            count={tableData.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Estás seguro de eliminar este cliente?"
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Eliminar
          </Button>
        }
      />
    </DashboardContent>
  );
}

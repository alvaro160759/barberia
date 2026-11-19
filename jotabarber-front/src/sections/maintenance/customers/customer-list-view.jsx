import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Table, Button, TableBody, TableContainer } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCustomers } from 'src/hooks/use-customers';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { varAlpha } from 'src/theme/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { CustomerTableRow } from './customer-table-row';
import { CustomerTableToolbar } from './customer-table-toolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '1', label: 'Activos' },
  { value: '0', label: 'Inactivos' },
];

const TABLE_HEAD = [
  { id: 'document_number', label: 'DNI', width: 120 },
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
  const filters = useSetState({ name: '', status: 'all' });

  useEffect(() => {
    const loadData = async () => {
      await fetchCustomers();
    };
    loadData();
  }, []);

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

  const handleFilterStatus = (event, newValue) => {
    table.onResetPage();
    filters.setState({ status: newValue });
  };

  const dataFiltered = tableData.filter((row) => {
    const q = filters.state.name.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [row.first_name, row.last_name, row.document_number, row.phone, row.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchesStatus =
      filters.state.status === 'all' || String(row.active) === filters.state.status;
    return matchesSearch && matchesStatus;
  });
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
          <Tabs
            value={filters.state.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === '1' && 'success') ||
                      (tab.value === '0' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((c) => String(c.active) === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <CustomerTableToolbar filters={filters} onResetPage={table.onResetPage} />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
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
            count={dataFiltered.length}
            page={table.page}
            dense={table.dense}
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

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useEmployees } from 'src/hooks/use-employees';
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
  emptyRows,
  rowInPage,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { EmployeeTableRow } from './employee-table-row';
import { EmployeeTableToolbar } from './employee-table-toolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '1', label: 'Activos' },
  { value: '0', label: 'Inactivos' },
];

const TABLE_HEAD = [
  { id: 'document_number', label: 'N° Documento', width: 120 },
  { id: 'first_name', label: 'Nombre' },
  { id: 'last_name', label: 'Apellido' },
  { id: 'job_type', label: 'Cargo' },
  { id: 'branch_name', label: 'Sucursal' },
  { id: 'phone', label: 'Teléfono' },
  { id: 'active', label: 'Estado', width: 80 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function EmployeeListView() {
  const router = useRouter();
  const table = useTable();
  const confirm = useBoolean();
  const { employees, loading, fetchEmployees, deleteEmployee } = useEmployees();
  const [tableData, setTableData] = useState([]);
  const filters = useSetState({ name: '', status: 'all' });

  useEffect(() => {
    const loadData = async () => {
      await fetchEmployees({ all: true });
    };
    loadData();
  }, [fetchEmployees]);

  useEffect(() => {
    setTableData(employees);
  }, [employees]);

  const handleDeleteRow = async (id) => {
    try {
      await deleteEmployee(id);
    } catch (error) {
      console.error('Error deleting employee:', error);
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
      [row.first_name, row.last_name, row.document_number, row.phone, row.email, row.branch_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchesStatus =
      filters.state.status === 'all' || String(row.active) === filters.state.status;
    return matchesSearch && matchesStatus;
  });
  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const notFound = !dataFiltered.length;

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Colaboradores"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
            { name: 'Colaboradores' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.maintenance.employees.new)}
            >
              Nuevo Empleado
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
                        : tableData.filter((e) => String(e.active) === tab.value).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <EmployeeTableToolbar filters={filters} onResetPage={table.onResetPage} />

            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
                action={
                  <Stack direction="row">
                    <Tooltip title="Seleccionar">
                      <IconButton color="primary">
                        <Iconify icon="eva:checkmark-circle-2-fill" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              />

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                        <EmployeeTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onEditRow={() => router.push(paths.dashboard.maintenance.employees.edit(row.id))}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </Box>

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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Estás seguro de que deseas eliminar este barbero?"
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}

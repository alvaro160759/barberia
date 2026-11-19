import { useState, useEffect,useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { accessApi } from 'src/actions/access';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UserTableRow } from './user-table-row';
import { UserTableToolbar } from './user-table-toolbar';
import { UserTableFiltersResult } from './user-table-filters-result';



// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '1', label: 'Activos' },
  { value: '0', label: 'Inactivos' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre', width: 300 },
  { id: 'username', label: 'Usuario' },
  { id: 'role_name', label: 'Rol' },
  { id: 'branches', label: 'Sedes', width: 220 },
  { id: 'email', label: 'Email' },
  { id: 'active', label: 'Estado', width: 100 },
  { id: 'actions', label: 'Acciones', width: 88 },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const filters = useSetState({ name: '', status: 'all' });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Cargar usuarios desde la API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accessApi.getUsers();
      // Laravel paginado: response.data.data es el array de items
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await accessApi.deleteUser(id);

        toast.success('Usuario desactivado correctamente');

        await fetchUsers();
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    },
    [dataInPage.length, table, fetchUsers]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => accessApi.deleteUser(id)));

      toast.success('Usuarios desactivados correctamente');

      table.setSelected([]);
      await fetchUsers();
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Error al eliminar usuarios');
    }
  }, [dataFiltered.length, dataInPage.length, table, fetchUsers]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.maintenance.users.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Usuarios"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Mantenimiento' },
            { name: 'Usuarios' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.maintenance.users.new}
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
            >
              Nuevo
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {loading ? <SplashScreen /> : 
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
                      : tableData.filter((user) => String(user.active) === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          
          <Box sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  
                />

                <TableBody>
                  {
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <UserTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                        />
                      ))
                  }

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
        }
      </DashboardContent>
      
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content={
          <>
            ¿Estás seguro de eliminar <strong> {table.selected.length} </strong> usuarios?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Eliminar
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  // Asegurarnos de que inputData sea un array
  if (!Array.isArray(inputData)) {
    return [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => String(user.active) === status);
  }

  return inputData;
}

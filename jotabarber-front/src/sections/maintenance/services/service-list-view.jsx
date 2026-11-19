import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Table, Button, TableBody, TableContainer } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useServices } from 'src/hooks/use-services';
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
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { ServiceTableRow } from './service-table-row';
import { ServiceTableToolbar } from './service-table-toolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '1', label: 'Activos' },
  { value: '0', label: 'Inactivos' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre' },
  { id: 'price', label: 'Precio' },
  { id: 'commission_percentage', label: '% Comisión' },
  { id: 'active', label: 'Estado', width: 80 },
  { id: 'acciones', width: 88 },
];

// ----------------------------------------------------------------------

export function ServiceListView() {
  const router = useRouter();
  const table = useTable();
  const confirm = useBoolean();
  const { services, loading, fetchServices, deleteService } = useServices();
  const [tableData, setTableData] = useState([]);
  const filters = useSetState({ name: '', status: 'all' });

  useEffect(() => {
    const loadData = async () => {
      await fetchServices();
    };
    loadData();
  }, [fetchServices]);

  useEffect(() => {
    setTableData(services);
  }, [services]);

  const handleDeleteRow = async (id) => {
    try {
      await deleteService(id);
    } catch (error) {
      console.error('Error deleting service:', error);
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
      [row.name, row.description]
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
        heading="Servicios"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Servicios' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.maintenance.services.new)}
          >
            Nuevo Servicio
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
                      : tableData.filter((s) => String(s.active) === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <ServiceTableToolbar filters={filters} onResetPage={table.onResetPage} />

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
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ServiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onEditRow={() => router.push(paths.dashboard.maintenance.services.edit(row.id))}
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
            </TableContainer>
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Estás seguro de eliminar este servicio?"
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Eliminar
          </Button>
        }
      />
    </DashboardContent>
  );
}

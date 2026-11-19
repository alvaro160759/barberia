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
import { useProducts } from 'src/hooks/use-products';
import { useBranches } from 'src/hooks/use-branches';
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

import { ProductTableRow } from './product-table-row';
import { ProductTableToolbar } from './product-table-toolbar';
import { StockEntryDialog } from './stock-entry-dialog';
import { InventoryMovementsDialog } from './inventory-movements-dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '1', label: 'Activos' },
  { value: '0', label: 'Inactivos' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre' },
  { id: 'category_name', label: 'Categoría' },
  { id: 'price', label: 'Precio' },
  { id: 'stock', label: 'Stock' },
  { id: 'active', label: 'Estado', width: 80 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function ProductListView() {
  const router = useRouter();
  const table = useTable();
  const confirm = useBoolean();
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const { branches, fetchBranches } = useBranches();
  const [tableData, setTableData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const filters = useSetState({ name: '', status: 'all' });
  const [stockProduct, setStockProduct] = useState(null);
  const [movementsOpen, setMovementsOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchBranches(), fetchProducts({ per_page: 100 })]);
  }, [fetchProducts, fetchBranches]);

  useEffect(() => {
    setTableData(products);
  }, [products]);

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    fetchProducts({ ...(branchId ? { branch_id: branchId } : {}), per_page: 100 });
  };

  const handleDeleteRow = async (id) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
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
      [row.name, row.category_name, row.sku, row.barcode]
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
          heading="Productos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
            { name: 'Productos' },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:inventory-line" />}
                onClick={() => setMovementsOpen(true)}
              >
                Movimientos
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => router.push(paths.dashboard.maintenance.products.new)}
              >
                Nuevo Producto
              </Button>
            </Stack>
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
                        : tableData.filter((p) => String(p.active) === tab.value).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <ProductTableToolbar
              onBranchChange={handleBranchChange}
              branches={branches}
              selectedBranch={selectedBranch}
              filters={filters}
              onResetPage={table.onResetPage}
            />

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
                        <ProductTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onEditRow={() => router.push(paths.dashboard.maintenance.products.edit(row.id))}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onStockEntry={() => setStockProduct(row)}
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

      <StockEntryDialog
        open={!!stockProduct}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSaved={() => fetchProducts({ ...(selectedBranch ? { branch_id: selectedBranch } : {}), per_page: 100 })}
      />

      <InventoryMovementsDialog
        open={movementsOpen}
        onClose={() => setMovementsOpen(false)}
        products={tableData}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Estás seguro de que deseas eliminar este producto?"
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}

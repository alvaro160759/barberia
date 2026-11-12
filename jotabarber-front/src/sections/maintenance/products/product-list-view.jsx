import { useState, useCallback, useEffect } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useProducts } from 'src/hooks/use-products';
import { useBranches } from 'src/hooks/use-branches';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SplashScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
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

import { ProductTableRow } from './product-table-row';
import { ProductTableToolbar } from './product-table-toolbar';

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

  useEffect(() => {
    const loadData = async () => {
      await fetchBranches();
      await fetchProducts();
    };
    loadData();
  }, [fetchProducts, fetchBranches]);

  useEffect(() => {
    setTableData(products);
  }, [products]);

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    fetchProducts(branchId ? { branch_id: branchId } : undefined);
  };

  const handleDeleteRow = async (id) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const dataFiltered = tableData;
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
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.maintenance.products.new)}
            >
              Nuevo Producto
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {loading ? (
          <SplashScreen />
        ) : (
          <Card>
            <ProductTableToolbar 
              onBranchChange={handleBranchChange}
              branches={branches}
              selectedBranch={selectedBranch}
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

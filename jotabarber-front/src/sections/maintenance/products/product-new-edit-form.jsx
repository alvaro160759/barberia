import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import { useProducts } from 'src/hooks/use-products';
import { SplashScreen } from 'src/components/loading-screen';

export function ProductNewEditForm({ currentProduct, onSuccess }) {
  const { createProduct, updateProduct, loading, fetchProductCategories, productCategories } = useProducts();

  const [formData, setFormData] = useState({
    name: currentProduct?.name || '',
    category_id: currentProduct?.category_id || '',
    sku: currentProduct?.sku || '',
    unit: currentProduct?.unit || 'UND',
    usage_type: currentProduct?.usage_type || 'SALE',
    price: currentProduct?.price || '',
    stock: currentProduct?.stock || 0,
    description: currentProduct?.description || '',
    active: currentProduct?.active ?? true,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      await fetchProductCategories();
      setIsLoading(false);
    };
    loadCategories();
  }, [fetchProductCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir category_id a número
      const dataToSend = { ...formData };
      if (dataToSend.category_id) {
        dataToSend.category_id = parseInt(dataToSend.category_id, 10);
      }
      
      // Si el SKU está vacío al actualizar, no lo enviamos
      if (currentProduct && !dataToSend.sku) {
        delete dataToSend.sku;
      }
      
      if (currentProduct) {
        // Una sola llamada que actualiza producto y precio/stock
        await updateProduct(currentProduct.id, dataToSend);
      } else {
        await createProduct(dataToSend);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      // El error ya es manejado por el hook con toast
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Categoría"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              {productCategories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Unidad"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            >
              <MenuItem value="UND">Unidad</MenuItem>
              <MenuItem value="ML">Mililitros</MenuItem>
              <MenuItem value="GR">Gramos</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Tipo de Uso"
              value={formData.usage_type}
              onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
              required
            >
              <MenuItem value="SALE">Venta</MenuItem>
              <MenuItem value="INTERNAL">Interno</MenuItem>
              <MenuItem value="BOTH">Ambos</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Activo"
            />
          </Grid>
          <Grid xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="button" variant="outlined" onClick={onSuccess} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Guardando...' : currentProduct ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </form>
  );
}

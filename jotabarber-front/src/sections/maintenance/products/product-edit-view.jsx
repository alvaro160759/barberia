import { useState, useEffect } from 'react';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams , useRouter } from 'src/routes/hooks';

import { useProducts } from 'src/hooks/use-products';

import { useSettingsContext } from 'src/components/settings';
import { SplashScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from './product-new-edit-form';

export function ProductEditView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { id } = useParams();
  const { fetchProduct, loading } = useProducts();
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await fetchProduct(id);
        setCurrentProduct(product);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    if (id) loadProduct();
  }, [id, fetchProduct]);

  const handleSuccess = () => {
    router.push(paths.dashboard.maintenance.products.root);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Producto"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Mantenimiento', href: paths.dashboard.maintenance.root },
          { name: 'Productos', href: paths.dashboard.maintenance.products.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {loading ? <SplashScreen /> : <ProductNewEditForm currentProduct={currentProduct} onSuccess={handleSuccess} />}
    </Container>
  );
}

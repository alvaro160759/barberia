import { useState, useCallback } from 'react';

import { catalogApi } from 'src/actions/catalog';

import { toast } from 'src/components/snackbar';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getProducts(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar productos';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getProductCategories();
      const data = response.data?.data || response.data || [];

      setProductCategories(Array.isArray(data.data) ? data.data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar categorías';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getProduct(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar producto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.createProduct(data);
      await fetchProducts();
      toast.success('Producto creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear producto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.updateProduct(id, data);
      await fetchProducts();
      toast.success('Producto actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar producto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await catalogApi.deleteProduct(id);
      await fetchProducts();
      toast.success('Producto eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar producto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  return {
    products,
    productCategories,
    loading,
    error,
    fetchProducts,
    fetchProductCategories,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

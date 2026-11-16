import { useState, useCallback } from 'react';

import { catalogApi } from 'src/actions/catalog';

import { toast } from 'src/components/snackbar';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getCustomers(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setCustomers(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar clientes';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getCustomer(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.createCustomer(data);
      await fetchCustomers();
      toast.success('Cliente creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.updateCustomer(id, data);
      await fetchCustomers();
      toast.success('Cliente actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await catalogApi.deleteCustomer(id);
      await fetchCustomers();
      toast.success('Cliente eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { toast } from 'src/components/snackbar';
import { catalogApi } from 'src/actions/catalog';
import { clearCurrentCustomer, setListaClientes, setCliente, setLoading, setError } from 'src/redux/slices/customersSlice';

export function useCustomers() {
  const dispatch = useDispatch();
  const { customers, currentCustomer, loading, error } = useSelector((state) => state.customers);

  const fetchCustomersData = useCallback(async (params) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await catalogApi.getCustomers(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      dispatch(setListaClientes(Array.isArray(data) ? data : []));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar clientes';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchCustomerData = useCallback(async (id) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await catalogApi.getCustomer(id);
      const data = response.data?.data || response.data;
      dispatch(setCliente(data));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar cliente';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createCustomerData = useCallback(async (data) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await catalogApi.createCustomer(data);
      await fetchCustomersData();
      toast.success('Cliente creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err?.message || 'Error al crear cliente';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchCustomersData]);

  const updateCustomerData = useCallback(async (id, data) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await catalogApi.updateCustomer(id, data);
      await fetchCustomersData();
      await fetchCustomerData(id);
      toast.success('Cliente actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar cliente';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchCustomersData, fetchCustomerData]);

  const deleteCustomerData = useCallback(async (id) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await catalogApi.deleteCustomer(id);
      await fetchCustomersData();
      toast.success('Cliente eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar cliente';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchCustomersData]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentCustomer());
  }, [dispatch]);

  return {
    customers,
    currentCustomer,
    loading,
    error,
    fetchCustomers: fetchCustomersData,
    fetchCustomer: fetchCustomerData,
    createCustomer: createCustomerData,
    updateCustomer: updateCustomerData,
    deleteCustomer: deleteCustomerData,
    clearCurrentCustomer: clearCurrent,
  };
}

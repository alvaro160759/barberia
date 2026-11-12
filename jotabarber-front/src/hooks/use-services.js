import { useState, useCallback } from 'react';
import { catalogApi } from 'src/actions/catalog';
import { toast } from 'src/components/snackbar';

export function useServices() {
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getServices(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar servicios';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceCategories = useCallback(async () => {
    try {
      const response = await catalogApi.getServiceCategories();
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setServiceCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading service categories:', err);
    }
  }, []);

  const fetchService = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.getService(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar servicio';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.createService(data);
      await fetchServices();
      toast.success('Servicio creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear servicio';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  const updateService = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.updateService(id, data);
      await fetchServices();
      toast.success('Servicio actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar servicio';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  const deleteService = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await catalogApi.deleteService(id);
      await fetchServices();
      toast.success('Servicio eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar servicio';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  return {
    services,
    serviceCategories,
    loading,
    error,
    fetchServices,
    fetchServiceCategories,
    fetchService,
    createService,
    updateService,
    deleteService,
  };
}

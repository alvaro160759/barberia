import { useState, useCallback } from 'react';

import { accessApi } from 'src/actions/access';

import { toast } from 'src/components/snackbar';

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getBranches();
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar sedes';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranch = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getBranch(id);
      const data = response.data?.data || response.data;
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar sede';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBranch = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.createBranch(data);
      await fetchBranches();
      toast.success('Sede creada correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear sede';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  const updateBranch = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.updateBranch(id, data);
      await fetchBranches();
      toast.success('Sede actualizada correctamente');
      return response.data;
    } catch (err) {
      // Manejar diferentes formatos de error
      if (err.errors) {
        // Si es un error de validación de Laravel, mostrar primero
        const firstError = err.errors?.active?.[0];

        toast.error(firstError);
      } else {
        toast.error(err.message);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
    }
  }, [fetchBranches]);

  const deleteBranch = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await accessApi.deleteBranch(id);
      await fetchBranches();
      toast.success('Sede eliminada correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar sede';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    fetchBranch,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}

import { useState, useCallback } from 'react';
import { accessApi } from 'src/actions/access';
import { toast } from 'src/components/snackbar';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getRoles();
      const data = response.data?.data || response.data || [];
      setRoles(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar roles';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRole = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getRole(id);
      const data = response.data?.data || response.data;
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar rol';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.createRole(data);
      await fetchRoles();
      toast.success('Rol creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear rol';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.updateRole(id, data);
      await fetchRoles();
      toast.success('Rol actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar rol';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await accessApi.deleteRole(id);
      await fetchRoles();
      toast.success('Rol eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar rol';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
  };
}

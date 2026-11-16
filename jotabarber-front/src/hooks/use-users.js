import { useState, useCallback } from 'react';

import { accessApi } from 'src/actions/access';

import { toast } from 'src/components/snackbar';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getUsers(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar usuarios';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.getUser(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.createUser(data);
      await fetchUsers();
      toast.success('Usuario creado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.updateUser(id, data);
      await fetchUsers();
      toast.success('Usuario actualizado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await accessApi.deleteUser(id);
      await fetchUsers();
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const assignUser = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accessApi.assignUser(data);
      toast.success('Usuario asignado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asignar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    assignUser,
  };
}

import { useState, useCallback } from 'react';

import { employeesApi } from 'src/actions/employees';

import { toast } from 'src/components/snackbar';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.getEmployees(params);
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setEmployees(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar empleados';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.getEmployee(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar empleado';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.createEmployee(data);
      await fetchEmployees();
      toast.success('Empleado creado correctamente');
      return response.data;
    } catch (err) {
      // Manejar diferentes formatos de error
      
      if (err.errors) {
        // Si es un error de validación de Laravel, mostrar primero
        const {errors} = err;
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
      } else if (err.message) {
        toast.error(err.message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.updateEmployee(id, data);
      await fetchEmployees();
      toast.success('Empleado actualizado correctamente');
      return response.data;
    } catch (err) {
      // Manejar diferentes formatos de error
      if (err.errors) {
        // Si es un error de validación de Laravel, mostrar primero
        const {errors} = err;
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
      } else if (err.message) {
        toast.error(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees]);

  const deleteEmployee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await employeesApi.deleteEmployee(id);
      await fetchEmployees();
      toast.success('Empleado eliminado correctamente');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar empleado';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees]);

  const assignEmployee = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.assignEmployee(data);
      toast.success('Empleado asignado correctamente');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asignar empleado';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignEmployee,
  };
}

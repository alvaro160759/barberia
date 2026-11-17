import type { ChangeEvent } from 'react';
import type { BarberOption , BranchOption, AppointmentRow, AppointmentStatus, AppointmentDetail, AppointmentFilters } from 'src/sections/appointments/appointments-constants';

import { useState, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { employeesApi } from 'src/actions/employees';
import { appointmentsApi } from 'src/actions/appointments';

import { toast } from 'src/components/snackbar';

export function useAppointments(appliedFilters: AppointmentFilters) {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(async (params: AppointmentFilters = appliedFilters) => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { per_page: 100 };
      if (params.from) query.from = params.from;
      if (params.to) query.to = params.to;
      if (params.barber_id) query.barber_id = params.barber_id;
      if (params.status) query.status = params.status;

      const response = await appointmentsApi.getAppointments(query);
      const data = response.data?.data?.data || response.data?.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await axios.get(endpoints.auth.branches);
        const list = response.data?.data || [];
        const branchesList: BranchOption[] = Array.isArray(list) ? list : [];
        setBranches(branchesList);
        const saved = localStorage.getItem('jota_branch_id');
        if (saved && branchesList.some((b) => String(b.id) === saved)) {
          setSelectedBranch(saved);
          axios.post(endpoints.auth.selectBranch, { branch_id: Number(saved) }).catch(() => {});
        }
      } catch (error) {
        console.error('Error fetching user branches:', error);
      }
    };
    loadBranches();
  }, []);

  const handleBranchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const branchId = event.target.value;
    setSelectedBranch(branchId);
    localStorage.setItem('jota_branch_id', branchId);
    try {
      await axios.post(endpoints.auth.selectBranch, { branch_id: Number(branchId) });
      await fetchAppointments();
    } catch (error) {
      console.error('Error selecting branch:', error);
    }
  };

  useEffect(() => {
    const loadBarbers = async () => {
      try {
        const response = await employeesApi.getDirectory({ per_page: 100 });
        const data = response.data?.data?.data || response.data?.data || [];
        const list: BarberOption[] = Array.isArray(data) ? data : [];
        setBarbers(list.filter((e) => e.job_type === 'BARBER' && e.active));
      } catch (error) {
        console.error('Error fetching barbers:', error);
      }
    };
    loadBarbers();
  }, []);

  const handleOpenDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await appointmentsApi.getAppointment(id);
      setDetail(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetail(null);
  };

  const handleNextStatus = async (nextStatus: AppointmentStatus) => {
    if (!detail) return;
    setActionLoading(true);
    try {
      await appointmentsApi.changeStatus(detail.id, { status: nextStatus });
      await fetchAppointments();
      const response = await appointmentsApi.getAppointment(detail.id);
      setDetail(response.data?.data || response.data);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al actualizar el estado de la cita');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    rows,
    barbers,
    branches,
    selectedBranch,
    loading,
    detailOpen,
    detail,
    detailLoading,
    actionLoading,
    refresh: fetchAppointments,
    handleBranchChange,
    handleOpenDetail,
    handleCloseDetail,
    handleNextStatus,
  };
}

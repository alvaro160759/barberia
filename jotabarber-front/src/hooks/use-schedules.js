import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { schedulesApi } from 'src/actions/schedules';
import { employeesApi } from 'src/actions/employees';

import { toast } from 'src/components/snackbar';

export const WEEKDAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export const SLOT_INTERVAL_OPTIONS = [30, 40, 60];

function extractList(response) {
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function useSchedules() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [slotInterval, setSlotInterval] = useState(60);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingTimeOff, setLoadingTimeOff] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchBarbers = useCallback(async () => {
    setLoadingBarbers(true);
    try {
      const response = await employeesApi.getEmployees({ job_type: 'BARBER', per_page: 100 });
      const list = extractList(response).filter((e) => e.job_type === 'BARBER' && e.active);
      setBarbers(list);
      setSelectedBarberId((prev) => {
        if (prev && list.some((b) => String(b.id) === String(prev))) return prev;
        return list.length ? String(list[0].id) : '';
      });
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Error al cargar los barberos');
    } finally {
      setLoadingBarbers(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const response = await schedulesApi.getBarberSchedules();
      setSchedules(extractList(response).filter((s) => s.active));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  const fetchTimeOff = useCallback(async () => {
    setLoadingTimeOff(true);
    try {
      const response = await schedulesApi.getTimeOff({ per_page: 100 });
      setTimeOff(extractList(response));
    } catch (error) {
      console.error('Error fetching time off:', error);
      toast.error('Error al cargar los bloqueos');
    } finally {
      setLoadingTimeOff(false);
    }
  }, []);

  const fetchSettings = useCallback(async (employeeId) => {
    if (!employeeId) {
      setSlotInterval(60);
      return;
    }
    try {
      const response = await schedulesApi.getSettings(employeeId);
      const data = response.data?.data ?? response.data;
      const value = Number(data?.slot_interval_minutes);
      setSlotInterval(value > 0 ? value : 60);
    } catch (error) {
      console.error('Error fetching schedule settings:', error);
      setSlotInterval(60);
    }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.auth.branches);
      const list = response.data?.data || [];
      const branchesList = Array.isArray(list) ? list : [];
      setBranches(branchesList);
      const saved = localStorage.getItem('jota_branch_id');
      if (saved && branchesList.some((b) => String(b.id) === saved)) {
        setSelectedBranch(saved);
        axios.post(endpoints.auth.selectBranch, { branch_id: Number(saved) }).catch(() => {});
      }
    } catch (error) {
      console.error('Error fetching user branches:', error);
    }
  }, []);

  const handleBranchChange = useCallback(
    async (event) => {
      const branchId = event.target.value;
      setSelectedBranch(branchId);
      localStorage.setItem('jota_branch_id', branchId);
      try {
        await axios.post(endpoints.auth.selectBranch, { branch_id: Number(branchId) });
      } catch (error) {
        console.error('Error selecting branch:', error);
      }
      setSelectedBarberId('');
      fetchBarbers();
      fetchSchedules();
      fetchTimeOff();
      fetchSettings('');
    },
    [fetchBarbers, fetchSchedules, fetchTimeOff, fetchSettings]
  );

  useEffect(() => {
    loadBranches();
    fetchBarbers();
    fetchSchedules();
    fetchTimeOff();
  }, [loadBranches, fetchBarbers, fetchSchedules, fetchTimeOff]);

  useEffect(() => {
    fetchSettings(selectedBarberId);
  }, [selectedBarberId, fetchSettings]);

  const barberSchedules = schedules.filter(
    (s) => String(s.employee_id) === String(selectedBarberId)
  );

  const schedulesByWeekday = WEEKDAYS.map((day) => ({
    ...day,
    ranges: barberSchedules
      .filter((s) => Number(s.weekday) === day.value)
      .map((s) => ({
        id: s.id,
        starts_at: (s.starts_at || '').slice(0, 5),
        ends_at: (s.ends_at || '').slice(0, 5),
      }))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
  }));

  const createSchedule = useCallback(
    async ({ employee_id, weekday, starts_at, ends_at }) => {
      try {
        await schedulesApi.createBarberSchedule({
          employee_id,
          weekday,
          starts_at: `${starts_at}:00`,
          ends_at: `${ends_at}:00`,
        });
        toast.success('Horario creado');
        await fetchSchedules();
      } catch (error) {
        const message =
          error?.errors?.starts_at?.[0] ||
          error?.message ||
          'Error al crear el horario';
        toast.error(message);
        throw error;
      }
    },
    [fetchSchedules]
  );

  const deleteSchedule = useCallback(
    async (id) => {
      try {
        await schedulesApi.deleteBarberSchedule(id);
        toast.success('Horario eliminado');
        await fetchSchedules();
      } catch (error) {
        toast.error(error?.message || 'Error al eliminar el horario');
        throw error;
      }
    },
    [fetchSchedules]
  );

  const replaceSchedule = useCallback(
    async ({ employee_id, weekday, starts_at, ends_at }) => {
      const existing = schedules.filter(
        (s) =>
          String(s.employee_id) === String(employee_id) &&
          Number(s.weekday) === Number(weekday)
      );
      await Promise.all(
        existing.map((schedule) => schedulesApi.deleteBarberSchedule(schedule.id))
      );
      await createSchedule({ employee_id, weekday, starts_at, ends_at });
    },
    [schedules, createSchedule]
  );

  const clearSchedule = useCallback(
    async ({ employee_id, weekday }) => {
      const existing = schedules.filter(
        (s) =>
          String(s.employee_id) === String(employee_id) &&
          Number(s.weekday) === Number(weekday)
      );
      await Promise.all(
        existing.map((schedule) => schedulesApi.deleteBarberSchedule(schedule.id))
      );
      toast.success('Horario eliminado');
      await fetchSchedules();
    },
    [schedules, fetchSchedules]
  );

  const createTimeOff = useCallback(
    async ({ employee_id, starts_at, ends_at, reason }) => {
      try {
        await schedulesApi.createTimeOff({
          employee_id,
          starts_at: dayjs(starts_at).format('YYYY-MM-DDTHH:mm:ssZ'),
          ends_at: dayjs(ends_at).format('YYYY-MM-DDTHH:mm:ssZ'),
          reason,
        });
        toast.success('Bloqueo creado');
        await fetchTimeOff();
      } catch (error) {
        const message =
          error?.errors?.starts_at?.[0] ||
          error?.message ||
          'Error al crear el bloqueo';
        toast.error(message);
        throw error;
      }
    },
    [fetchTimeOff]
  );

  const deleteTimeOff = useCallback(
    async (id) => {
      try {
        await schedulesApi.deleteTimeOff(id);
        toast.success('Bloqueo eliminado');
        await fetchTimeOff();
      } catch (error) {
        toast.error(error?.message || 'Error al eliminar el bloqueo');
        throw error;
      }
    },
    [fetchTimeOff]
  );

  const updateSlotInterval = useCallback(
    async (value) => {
      if (!selectedBarberId) return;
      setSavingSettings(true);
      try {
        await schedulesApi.updateSettings({
          employee_id: Number(selectedBarberId),
          slot_interval_minutes: Number(value),
        });
        setSlotInterval(Number(value));
        toast.success('Intervalo de disponibilidad actualizado');
      } catch (error) {
        toast.error(error?.message || 'Error al guardar la configuración');
      } finally {
        setSavingSettings(false);
      }
    },
    [selectedBarberId]
  );

  const barberName = useCallback(
    (id) => {
      const barber = barbers.find((b) => String(b.id) === String(id));
      return barber ? `${barber.first_name} ${barber.last_name}`.trim() : `#${id}`;
    },
    [barbers]
  );

  return {
    branches,
    selectedBranch,
    handleBranchChange,
    barbers,
    selectedBarberId,
    setSelectedBarberId,
    schedulesByWeekday,
    timeOff,
    slotInterval,
    SLOT_INTERVAL_OPTIONS,
    loadingBarbers,
    loadingSchedules,
    loadingTimeOff,
    savingSettings,
    refresh: () => {
      fetchSchedules();
      fetchTimeOff();
      fetchSettings(selectedBarberId);
    },
    createSchedule,
    replaceSchedule,
    clearSchedule,
    deleteSchedule,
    createTimeOff,
    deleteTimeOff,
    updateSlotInterval,
    barberName,
  };
}

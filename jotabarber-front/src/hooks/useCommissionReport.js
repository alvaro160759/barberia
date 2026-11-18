import { useState, useEffect, useCallback } from 'react';
import { catalogApi } from 'src/actions/catalog';
import { employeesApi } from 'src/actions/employees';
import { accessApi } from 'src/actions/access';
import axios from 'src/utils/axios';

const COMMISSION_REPORT_API = '/api/reports/by-barber';

function getRange(period, date) {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (period) {
    case 'day':
      return [formatDate(d), formatDate(d)];
    case 'week':
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [formatDate(monday), formatDate(sunday)];
    case 'month':
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return [formatDate(firstDay), formatDate(lastDay)];
    case 'year':
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const yearEnd = new Date(d.getFullYear(), 11, 31);
      return [formatDate(yearStart), formatDate(yearEnd)];
    default:
      return [formatDate(d), formatDate(d)];
  }
}

export function useCommissionReport() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [period, setPeriod] = useState('day');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [branchId, setBranchId] = useState('');

  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);

  const [summary, setSummary] = useState(null);
  const [byBarber, setByBarber] = useState([]);
  const [byServiceType, setByServiceType] = useState([]);
  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const fetchBarbers = useCallback(async () => {
    try {
      const res = await employeesApi.getEmployees({ job_type: 'BARBER', all: true });
      setBarbers(Array.isArray(res.data?.data?.data) ? res.data.data.data : []);
    } catch (err) {
      console.error('Error cargando barberos:', err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await catalogApi.getServices();
      setServices(Array.isArray(res.data?.data?.data) ? res.data.data.data : []);
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await accessApi.getBranches();
      setBranches(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Error cargando sedes:', err);
    }
  }, []);

  const fetchReport = useCallback(async (barberOverride) => {
    setLoading(true);
    try {
      const [from, to] = getRange(period, date);
      const params = { from, to };
      const activeBarberId = barberOverride ?? barberId;
      const activeServiceId = serviceId;
      const activeBranchId = branchId;
      if (activeBarberId && activeBarberId !== '') params.barber_id = parseInt(activeBarberId, 10);
      if (activeServiceId && activeServiceId !== '') params.service_id = parseInt(activeServiceId, 10);
      if (activeBranchId && activeBranchId !== '') params.branch_id = parseInt(activeBranchId, 10);

      const res = await axios.get(COMMISSION_REPORT_API, { params });
      const data = res.data?.data || {};

      setSummary(data.summary || null);
      setByBarber(Array.isArray(data.by_barber) ? data.by_barber : []);
      setByServiceType(Array.isArray(data.by_service_type) ? data.by_service_type : []);
      setDetails(data.details || null);
    } catch (err) {
      console.error('Error cargando reporte:', err);
    } finally {
      setLoading(false);
    }
  }, [period, date, barberId, serviceId, branchId]);

  const handleViewDetail = useCallback((barber) => {
    setSelectedBarber(barber);
    setBarberId(barber.barber_id);
    fetchReport(parseInt(barber.barber_id, 10));
    setDetailDialogOpen(true);
  }, [fetchReport]);

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedBarber(null);
    setBarberId('');
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    fetchBarbers();
    fetchServices();
    fetchBranches();
  }, [fetchBarbers, fetchServices, fetchBranches]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    // Estado
    date,
    period,
    barberId,
    serviceId,
    branchId,
    barbers,
    services,
    branches,
    summary,
    byBarber,
    byServiceType,
    details,
    loading,
    detailDialogOpen,
    selectedBarber,
    // Setters
    setDate,
    setPeriod,
    setBarberId,
    setServiceId,
    setBranchId,
    // Handlers
    handleViewDetail,
    handleCloseDetail,
    fetchReport,
  };
}

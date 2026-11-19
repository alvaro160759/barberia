import { useState, useEffect, useCallback } from 'react';
import { catalogApi } from 'src/actions/catalog';
import { employeesApi } from 'src/actions/employees';
import { accessApi } from 'src/actions/access';
import axios from 'src/utils/axios';

const COMMISSION_REPORT_API = '/api/reports/by-barber';

function formatDateLocal(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRange(period, { date, monthValue, yearValue, rangeFrom, rangeTo }) {
  if (period === 'custom') {
    return [rangeFrom || date, rangeTo || date];
  }
  if (period === 'month' && monthValue) {
    const [y, m] = monthValue.split('-').map(Number);
    return [formatDateLocal(new Date(y, m - 1, 1)), formatDateLocal(new Date(y, m, 0))];
  }
  if (period === 'year' && yearValue) {
    const y = parseInt(yearValue, 10);
    if (!Number.isNaN(y)) {
      return [formatDateLocal(new Date(y, 0, 1)), formatDateLocal(new Date(y, 11, 31))];
    }
  }
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  switch (period) {
    case 'week': {
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [formatDateLocal(monday), formatDateLocal(sunday)];
    }
    case 'month': {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return [formatDateLocal(firstDay), formatDateLocal(lastDay)];
    }
    case 'year': {
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const yearEnd = new Date(d.getFullYear(), 11, 31);
      return [formatDateLocal(yearStart), formatDateLocal(yearEnd)];
    }
    default:
      return [formatDateLocal(d), formatDateLocal(d)];
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
  const [monthValue, setMonthValue] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [yearValue, setYearValue] = useState(() => String(new Date().getFullYear()));
  const [rangeFrom, setRangeFrom] = useState(() => {
    const today = new Date();
    return formatDateLocal(today);
  });
  const [rangeTo, setRangeTo] = useState(() => {
    const today = new Date();
    return formatDateLocal(today);
  });
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
      const [from, to] = getRange(period, { date, monthValue, yearValue, rangeFrom, rangeTo });
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
  }, [period, date, monthValue, yearValue, rangeFrom, rangeTo, barberId, serviceId, branchId]);

  const [from, to] = getRange(period, { date, monthValue, yearValue, rangeFrom, rangeTo });
  const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formatRangeDate = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const weekdayOf = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return WEEKDAYS[new Date(y, m - 1, d).getDay()];
  };
  const monthNameOf = (iso) => {
    const [y, m] = iso.split('-').map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  };
  let dateRangeLabel;
  switch (period) {
    case 'day':
      dateRangeLabel = `${weekdayOf(from)} ${formatRangeDate(from)}`;
      break;
    case 'week':
      dateRangeLabel = `${weekdayOf(from)} ${formatRangeDate(from)} al ${weekdayOf(to)} ${formatRangeDate(to)}`;
      break;
    case 'month':
      dateRangeLabel = `Mes de ${monthNameOf(from)}`;
      break;
    case 'year':
      dateRangeLabel = `Año ${from.slice(0, 4)}`;
      break;
    default:
      dateRangeLabel = `Del ${formatRangeDate(from)} al ${formatRangeDate(to)}`;
  }

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
    monthValue,
    yearValue,
    rangeFrom,
    rangeTo,
    dateRangeLabel,
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
    setMonthValue,
    setYearValue,
    setRangeFrom,
    setRangeTo,
    setBarberId,
    setServiceId,
    setBranchId,
    // Handlers
    handleViewDetail,
    handleCloseDetail,
    fetchReport,
  };
}

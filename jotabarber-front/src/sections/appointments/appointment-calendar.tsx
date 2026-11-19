import type { EventInput, DatesSetArg, EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { appointmentsApi } from 'src/actions/appointments';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { StyledCalendar } from 'src/sections/calendar/styles';

import {
  type AppointmentRow,
  getAppointmentStatusLabel,
  type AppointmentFilters as AppointmentFiltersState,
} from './appointments-constants';

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Mes', icon: 'mingcute:calendar-month-line' },
  { value: 'timeGridWeek', label: 'Semana', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Día', icon: 'mingcute:calendar-day-line' },
  { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
];

const CLIENT_COLORS = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#7b1fa2',
  '#00838f',
  '#c2185b',
  '#5d4037',
  '#455a64',
  '#afb42b',
  '#6d4c41',
  '#0277bd',
];

function clientColorIndex(key: string): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 33 + key.charCodeAt(i)) % 2147483647;
  }
  return hash % CLIENT_COLORS.length;
}

const CLIENT_COLOR_STYLES = Object.fromEntries(
  CLIENT_COLORS.map((color, index) => [
    `& .fc .fc-event.appt-c${index} .fc-event-main::before`,
    { backgroundColor: color },
  ])
);

interface AppointmentCalendarProps {
  selectedBranch: string;
  filters: AppointmentFiltersState;
  refreshKey?: number;
  onOpenDetail: (id: number) => void;
}

function toCalendarEvent(row: AppointmentRow): EventInput {
  const start = row.starts_local ? `${row.starts_local.replace(' ', 'T')}:00` : undefined;
  const day = row.starts_local?.slice(0, 10);
  const end =
    day && row.ends_local
      ? `${day}T${row.ends_local.length === 5 ? `${row.ends_local}:00` : row.ends_local}`
      : undefined;

  const customer =
    `${row.customer_first_name ?? ''} ${row.customer_last_name ?? ''}`.trim() || 'Cliente';
  const barber = `${row.barber_first_name ?? ''} ${row.barber_last_name ?? ''}`.trim();
  const time = row.starts_local?.slice(11, 16) ?? '';
  const colorIndex = clientColorIndex(customer.toLowerCase());

  return {
    id: String(row.id),
    title: [time, customer, barber, getAppointmentStatusLabel(row.status)]
      .filter(Boolean)
      .join(' · '),
    start,
    end,
    color: CLIENT_COLORS[colorIndex],
    textColor: '#fff',
    classNames: [`appt-c${colorIndex}`, `appt-status-${row.status.toLowerCase()}`],
    extendedProps: { status: row.status },
  };
}

export function AppointmentCalendar({
  selectedBranch,
  filters,
  refreshKey = 0,
  onOpenDetail,
}: AppointmentCalendarProps) {
  const smUp = useResponsive('up', 'sm');
  const calendarRef = useRef<InstanceType<typeof Calendar>>(null);
  const popover = usePopover();
  const firstRender = useRef(true);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'listWeek');
  const [dateLabel, setDateLabel] = useState(() => fDate(new Date()));

  const {
    barber_id: filterBarberId,
    status: filterStatus,
    from: filterFrom,
    to: filterTo,
  } = filters;

  const fetchRange = useCallback(
    async (start: Date, end: Date) => {
      setLoading(true);
      try {
        let from = dayjs(start).format('YYYY-MM-DD');
        let to = dayjs(end).subtract(1, 'day').format('YYYY-MM-DD');
        if (filterFrom && filterFrom > from) from = filterFrom;
        if (filterTo && filterTo < to) to = filterTo;

        if (from > to) {
          setEvents([]);
          return;
        }

        const query: Record<string, string | number> = {
          per_page: 200,
          from,
          to,
        };
        if (filterBarberId) query.barber_id = filterBarberId;
        if (filterStatus) query.status = filterStatus;

        const response = await appointmentsApi.getAppointments(query);
        const data = response.data?.data?.data || response.data?.data || [];
        const rows: AppointmentRow[] = Array.isArray(data) ? data : [];
        setEvents(rows.map((row) => toCalendarEvent(row)));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    },
    [filterBarberId, filterStatus, filterFrom, filterTo]
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      setView(arg.view.type);
      setDateLabel(fDate(arg.view.currentStart));
      fetchRange(arg.start, arg.end);
    },
    [fetchRange]
  );

  useEffect(() => {
    // Refetch the visible range when barber/status filters change (datesSet covers mount/navigation)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const api = calendarRef.current?.getApi();
    const currentView = api?.view;
    if (currentView) {
      fetchRange(currentView.currentStart, currentView.currentEnd);
    }
  }, [fetchRange, selectedBranch, refreshKey]);

  const calendarApi = () => calendarRef.current?.getApi();

  const selectedView = VIEW_OPTIONS.find((option) => option.value === view) ?? VIEW_OPTIONS[0];

  return (
    <Card sx={{ minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, flexWrap: 'wrap', gap: 1, position: 'relative' }}
      >
        <Box display="flex" alignItems="center">
          <IconButton
            size="small"
            onClick={popover.onOpen}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <Iconify icon={selectedView.icon} />
          </IconButton>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'block', sm: 'none' }, mr: 1 }}
          >
            {selectedView.label}
          </Typography>
          <IconButton size="small" onClick={() => calendarApi()?.prev()}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: 160, textAlign: 'center', fontWeight: 600 }}
          >
            {dateLabel}
          </Typography>
          <IconButton size="small" onClick={() => calendarApi()?.next()}>
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Box>

        <Button
          size="small"
          color="error"
          variant="contained"
          onClick={() => calendarApi()?.today()}
        >
          Hoy
        </Button>

        {loading && (
          <LinearProgress
            sx={{ left: 0, width: 1, height: 2, bottom: 0, borderRadius: 0, position: 'absolute' }}
          />
        )}
      </Box>

      <StyledCalendar
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          '.fc.fc-media-screen': { flex: '1 1 auto' },
          // El relleno del evento usa el color del cliente; el estado se
          // distingue atenuando/variando el evento vía classNames.
          '& .fc .fc-event': { cursor: 'pointer' },
          '& .fc .fc-event:hover .fc-event-main': {
            position: 'relative',
            zIndex: 5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
          },
          '& .fc .fc-event .fc-event-main::before': { opacity: 0.9 },
          '& .fc .fc-event .fc-event-main-frame': { color: '#fff', filter: 'none' },
          ...CLIENT_COLOR_STYLES,
          '& .fc .fc-event.appt-status-cancelled, & .fc .fc-event.appt-status-no_show': {
            opacity: 0.45,
          },
          '& .fc .fc-event.appt-status-pending .fc-event-main::before': { opacity: 0.14 },
          '& .fc .fc-event.appt-status-in_progress .fc-event-main::before': { opacity: 0.32 },
        }}
      >
        <Calendar
          weekends
          initialView={view}
          dayMaxEventRows={3}
          eventDisplay="block"
          events={events}
          headerToolbar={false}
          height="100%"
          datesSet={handleDatesSet}
          eventClick={(arg: EventClickArg) => onOpenDetail(Number(arg.event.id))}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          ref={calendarRef}
          locale={esLocale}
        />
      </StyledCalendar>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList>
          {VIEW_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === view}
              onClick={() => {
                popover.onClose();
                calendarApi()?.changeView(option.value);
                setView(option.value);
              }}
            >
              <Iconify icon={option.icon} sx={{ mr: 1 }} />
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </Card>
  );
}

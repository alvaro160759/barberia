import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  home: icon('ic-design'),
  barbero: icon('ic-barbero'),
  products: icon('ic-products'),
  services: icon('ic-servicio'),
  gasto: icon('ic-gasto'),
  customer: icon('ic-customer'),
  caja: icon('ic-caja'),
  servicio: icon('servicios'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'PRINCIPAL',
    items: [
      { title: 'Home', path: paths.dashboard.root, icon: ICONS.ecommerce },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Mantenimiento',
    items: [
      {
        title: 'Usuarios',
        path: paths.dashboard.maintenance.users.root,
        icon: ICONS.user,
      },
      {
        title: 'Roles',
        path: paths.dashboard.maintenance.roles.root,
        icon: ICONS.lock,
      },
      {
        title: 'Sedes',
        path: paths.dashboard.maintenance.branches.root,
        icon: ICONS.tour,
      },
      {
        title: 'Colaboradores',
        path: paths.dashboard.maintenance.employees.root,
        icon: ICONS.barbero,
      },
      {
        title: 'Clientes',
        path: paths.dashboard.maintenance.customers.root,
        icon: ICONS.customer,
      },
      {
        title: 'Productos',
        path: paths.dashboard.maintenance.products.root,
        icon: ICONS.products,
      },
      {
        title: 'Servicios',
        path: paths.dashboard.maintenance.services.root,
        icon: ICONS.services,
      },
    ],
  },
  {
    subheader: 'Gestión',
    items: [
      {
        title: 'Gestión de Caja',
        path: paths.dashboard.sales.cashHistory,
        icon: ICONS.caja,
      },
      {
        title: 'Gestión de servicios',
        path: paths.dashboard.sales.root,
        icon: ICONS.servicio,
      },
      {
        title: 'Gestión de citas',
        path: paths.dashboard.appointments.root,
        icon: ICONS.calendar,
      },
      {
        title: 'Gestión de egresos',
        path: paths.dashboard.sales.expenses,
        icon: ICONS.order,
      },
    ],
  },
  {
    subheader: 'Reportes',
    items: [
      {
        title: 'Comisiones por barbero',
        path: paths.dashboard.reports.commission,
        icon: ICONS.analytics,
      },
      {
        title: 'Reporte ingresos y egresos',
        path: paths.dashboard.reports.incomeExpense,
        icon: ICONS.dashboard,
      },
    ],
  },
];

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'PRINCIPAL',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
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
        title: 'Permisos',
        path: paths.dashboard.maintenance.permissions,
        icon: ICONS.parameter,
      },
      {
        title: 'Menús',
        path: paths.dashboard.maintenance.menus,
        icon: ICONS.menuItem,
      },
      {
        title: 'Sedes',
        path: paths.dashboard.maintenance.branches.root,
        icon: ICONS.tour,
      },
      {
        title: 'Empleados',
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
        title: 'Gestión de servicios',
        path: paths.dashboard.sales.serviceRegistration,
        icon: ICONS.gasto,
      },
      {
        title: 'Gestión de citas',
        path: paths.dashboard.appointments.root,
        icon: ICONS.label,
      },
      {
        title: 'Gestión de egresos',
        path: '#/dashboard/menu_level',
        icon: ICONS.order,
      },
    ],
  },
  {
    subheader: 'Reportes',
    items: [
      {
        title: 'Reporte de servicios',
        path: '#/dashboard/menu_level',
        icon: ICONS.analytics,
      },
      {
        title: 'Reporte de egresos',
        path: '#/dashboard/menu_level',
        icon: ICONS.analytics,
      },
    ],
  },
];

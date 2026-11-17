// Declaraciones para componentes JS sin tipar (allowJs infiere props requeridas).
// Se usan como `any` para no romper el typecheck en archivos .tsx.

declare module 'src/components/iconify' {
  export const Iconify: any;
}

declare module 'src/components/hook-form' {
  export const Form: any;
  export const Field: any;
}

declare module 'src/components/snackbar' {
  export const toast: any;
}

declare module 'src/components/loading-screen' {
  export const SplashScreen: any;
}

declare module 'src/components/custom-breadcrumbs' {
  export const CustomBreadcrumbs: any;
}

declare module 'src/components/scrollbar' {
  export const Scrollbar: any;
}

declare module 'src/components/table' {
  export const useTable: any;
  export const TableNoData: any;
  export const TablePaginationCustom: any;
  export const TableHeadCustom: any;
  export const TableEmptyRows: any;
  export const TableSelectedAction: any;
  export const emptyRows: any;
  export const rowInPage: any;
  export const getComparator: any;
}

declare module 'src/layouts/dashboard' {
  export const DashboardContent: any;
}

declare module 'src/api/public-booking' {
  export const publicBookingApi: any;
}

declare module 'src/actions/appointments' {
  export const appointmentsApi: any;
}

declare module 'src/actions/employees' {
  export const employeesApi: any;
}

declare module 'src/actions/access' {
  export const accessApi: any;
}

declare module 'src/utils/axios' {
  const axios: any;
  export const endpoints: any;
  export default axios;
}

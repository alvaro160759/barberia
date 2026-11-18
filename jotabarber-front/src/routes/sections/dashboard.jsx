import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
// Maintenance
const UsersListPage = lazy(() => import('src/pages/maintenance/users/index'));
const UsersCreatePage = lazy(() => import('src/pages/maintenance/users/create'));
const UsersEditPage = lazy(() => import('src/pages/maintenance/users/edit'));
const RolesListPage = lazy(() => import('src/pages/maintenance/roles/index'));
const RolesCreatePage = lazy(() => import('src/pages/maintenance/roles/create'));
const RolesEditPage = lazy(() => import('src/pages/maintenance/roles/edit'));
const PermissionsListPage = lazy(() => import('src/pages/maintenance/permissions/index'));
const MenusListPage = lazy(() => import('src/pages/maintenance/menus/index'));
const BranchesListPage = lazy(() => import('src/pages/maintenance/branches/index'));
const BranchesCreatePage = lazy(() => import('src/pages/maintenance/branches/create'));
const BranchesEditPage = lazy(() => import('src/pages/maintenance/branches/edit'));
const EmployeesListPage = lazy(() => import('src/pages/maintenance/employees/index'));
const EmployeesCreatePage = lazy(() => import('src/pages/maintenance/employees/create'));
const EmployeesEditPage = lazy(() => import('src/pages/maintenance/employees/edit'));
const ProductsListPage = lazy(() => import('src/pages/maintenance/products/index'));
const ProductsCreatePage = lazy(() => import('src/pages/maintenance/products/create'));
const ProductsEditPage = lazy(() => import('src/pages/maintenance/products/edit'));
const ServicesListPage = lazy(() => import('src/pages/maintenance/services/index'));
const ServicesCreatePage = lazy(() => import('src/pages/maintenance/services/create'));
const ServicesEditPage = lazy(() => import('src/pages/maintenance/services/edit'));
const SalesListPage = lazy(() => import('src/pages/sales/index'));
const ServiceRegistrationPage = lazy(() => import('src/pages/sales/service-registration'));
const CashHistoryPage = lazy(() => import('src/pages/sales/cash-history'));
const ExpensesPage = lazy(() => import('src/pages/sales/expenses'));
const CommissionReportPage = lazy(() => import('src/pages/reports/commission'));
const IncomeExpenseReportPage = lazy(() => import('src/pages/reports/income-expense-report'));
const AppointmentsPage = lazy(() => import('src/pages/appointments'));
// Customers
const CustomersListPage = lazy(() => import('src/pages/maintenance/customers/index'));
const CustomersCreatePage = lazy(() => import('src/pages/maintenance/customers/create'));
const CustomersEditPage = lazy(() => import('src/pages/maintenance/customers/edit'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'course', element: <OverviewCoursePage /> },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
      {
        path: 'maintenance',
        children: [
          {
            path: 'users',
            children: [
              { element: <UsersListPage />, index: true },
              { path: 'new', element: <UsersCreatePage /> },
              { path: ':id/edit', element: <UsersEditPage /> },
            ],
          },
          {
            path: 'roles',
            children: [
              { element: <RolesListPage />, index: true },
              { path: 'new', element: <RolesCreatePage /> },
              { path: ':id/edit', element: <RolesEditPage /> },
            ],
          },
          { path: 'permissions', element: <PermissionsListPage /> },
          { path: 'menus', element: <MenusListPage /> },
          {
            path: 'branches',
            children: [
              { element: <BranchesListPage />, index: true },
              { path: 'new', element: <BranchesCreatePage /> },
              { path: ':id/edit', element: <BranchesEditPage /> },
            ],
          },
          {
            path: 'employees',
            children: [
              { element: <EmployeesListPage />, index: true },
              { path: 'new', element: <EmployeesCreatePage /> },
              { path: ':id/edit', element: <EmployeesEditPage /> },
            ],
          },
          {
            path: 'products',
            children: [
              { element: <ProductsListPage />, index: true },
              { path: 'new', element: <ProductsCreatePage /> },
              { path: ':id/edit', element: <ProductsEditPage /> },
            ],
          },
          {
            path: 'services',
            children: [
              { element: <ServicesListPage />, index: true },
              { path: 'new', element: <ServicesCreatePage /> },
              { path: ':id/edit', element: <ServicesEditPage /> },
            ],
          },
          {
            path: 'customers',
            children: [
              { element: <CustomersListPage />, index: true },
              { path: 'new', element: <CustomersCreatePage /> },
              { path: ':id/edit', element: <CustomersEditPage /> },
            ],
          },
        ],
      },
      {
        path: 'sales',
        children: [
          { element: <SalesListPage />, index: true },
          { path: 'service-registration', element: <ServiceRegistrationPage /> },
          { path: 'cash-history', element: <CashHistoryPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
        ],
      },
      {
        path: 'reports',
        children: [
          { path: 'commission', element: <CommissionReportPage /> },
          { path: 'income-expense', element: <IncomeExpenseReportPage /> },
        ],
      },
      { path: 'appointments', element: <AppointmentsPage /> },
    ],
  },
];

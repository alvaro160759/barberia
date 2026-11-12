# Endpoints JOTABARBER

Base: `/api`. Envía `Accept: application/json`. Autenticación por cookie Sanctum o Bearer. No se acepta branch_id para cambiar la sucursal de una operación; usa POST /auth/branch.

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/auth/login` | Público, limitado |
| POST | `/api/auth/token` | Público, limitado |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/auth/branches` | Autenticado |
| POST | `/api/auth/branch` | Autenticado |
| POST | `/api/auth/logout` | Autenticado |
| GET | `/api/auth/menu` | @branch |
| GET | `/api/branches` | branches.view |
| POST | `/api/branches` | branches.manage |
| PUT | `/api/branches/{id}` | branches.manage |
| GET | `/api/users` | users.view |
| POST | `/api/users` | users.manage |
| PUT | `/api/users/{id}` | users.manage |
| POST | `/api/user-branches` | users.manage |
| GET | `/api/roles` | roles.view |
| GET | `/api/permissions` | roles.view |
| GET | `/api/menus` | roles.view |
| PUT | `/api/menus/{id}` | roles.manage |
| POST | `/api/roles` | roles.manage |
| PUT | `/api/roles/{id}` | roles.manage |
| GET | `/api/customers` | customers.view |
| GET | `/api/customers/{id}` | customers.view |
| POST | `/api/customers` | customers.manage |
| PUT | `/api/customers/{id}` | customers.manage |
| DELETE | `/api/customers/{id}` | customers.manage |
| GET | `/api/service-categories` | services.view |
| GET | `/api/service-categories/{id}` | services.view |
| POST | `/api/service-categories` | services.manage |
| PUT | `/api/service-categories/{id}` | services.manage |
| DELETE | `/api/service-categories/{id}` | services.manage |
| GET | `/api/services` | services.view |
| GET | `/api/services/{id}` | services.view |
| POST | `/api/services` | services.manage |
| PUT | `/api/services/{id}` | services.manage |
| DELETE | `/api/services/{id}` | services.manage |
| GET | `/api/product-categories` | products.view |
| GET | `/api/product-categories/{id}` | products.view |
| POST | `/api/product-categories` | products.manage |
| PUT | `/api/product-categories/{id}` | products.manage |
| DELETE | `/api/product-categories/{id}` | products.manage |
| GET | `/api/products` | products.view |
| GET | `/api/products/{id}` | products.view |
| POST | `/api/products` | products.manage |
| PUT | `/api/products/{id}` | products.manage |
| DELETE | `/api/products/{id}` | products.manage |
| GET | `/api/expense-categories` | expenses.view |
| GET | `/api/expense-categories/{id}` | expenses.view |
| POST | `/api/expense-categories` | expenses.manage |
| PUT | `/api/expense-categories/{id}` | expenses.manage |
| DELETE | `/api/expense-categories/{id}` | expenses.manage |
| GET | `/api/cash-registers` | cash.view |
| GET | `/api/cash-registers/{id}` | cash.view |
| POST | `/api/cash-registers` | cash.manage |
| PUT | `/api/cash-registers/{id}` | cash.manage |
| DELETE | `/api/cash-registers/{id}` | cash.manage |
| GET | `/api/payment-methods` | cash.view |
| GET | `/api/payment-methods/{id}` | cash.view |
| POST | `/api/payment-methods` | roles.manage |
| PUT | `/api/payment-methods/{id}` | roles.manage |
| DELETE | `/api/payment-methods/{id}` | roles.manage |
| GET | `/api/employees` | employees.view |
| GET | `/api/employees/directory` | users.manage |
| POST | `/api/employees` | employees.manage |
| GET | `/api/employees/{id}` | employees.view |
| PUT | `/api/employees/{id}` | employees.manage |
| DELETE | `/api/employees/{id}` | employees.manage |
| POST | `/api/employee-branches` | users.manage |
| GET | `/api/branch-services` | services.view |
| PUT | `/api/branch-services` | services.manage |
| GET | `/api/branch-products` | products.view |
| PUT | `/api/branch-products` | products.manage |
| GET | `/api/barber-service-rates` | services.view |
| PUT | `/api/barber-service-rates` | services.manage |
| GET | `/api/barber-schedules` | employees.view |
| POST | `/api/barber-schedules` | employees.manage |
| DELETE | `/api/barber-schedules/{id}` | employees.manage |
| GET | `/api/barber-time-off` | employees.view |
| POST | `/api/barber-time-off` | employees.manage |
| DELETE | `/api/barber-time-off/{id}` | employees.manage |
| GET | `/api/appointments` | appointments.view |
| GET | `/api/appointments/{id}` | appointments.view |
| POST | `/api/appointments` | appointments.manage |
| PUT | `/api/appointments/{id}` | appointments.manage |
| PATCH | `/api/appointments/{id}/status` | appointments.manage |
| GET | `/api/my-appointments` | appointments.view_own |
| GET | `/api/my-appointments/{id}` | appointments.view_own |
| GET | `/api/sales` | sales.view |
| GET | `/api/sales/{id}` | sales.view |
| POST | `/api/sales` | sales.create |
| POST | `/api/sales/{id}/payments` | sales.create |
| POST | `/api/sales/{id}/cancel` | sales.cancel |
| GET | `/api/inventory-movements` | inventory.view |
| POST | `/api/inventory-movements` | inventory.manage |
| GET | `/api/cash-sessions` | cash.view |
| GET | `/api/cash-sessions/{id}` | cash.view |
| POST | `/api/cash-sessions` | cash.manage |
| POST | `/api/cash-sessions/{id}/close` | cash.manage |
| GET | `/api/expenses` | expenses.view |
| GET | `/api/expenses/{id}` | expenses.view |
| POST | `/api/expenses` | expenses.manage |
| GET | `/api/commissions/pending` | commissions.view |
| GET | `/api/commissions` | commissions.view |
| GET | `/api/commissions/{id}` | commissions.view |
| GET | `/api/my-commissions/pending` | commissions.view_own |
| GET | `/api/my-commissions` | commissions.view_own |
| GET | `/api/my-commissions/{id}` | commissions.view_own |
| POST | `/api/commissions` | commissions.pay |
| GET | `/api/reports/dashboard` | dashboard.view |
| GET | `/api/reports/by-barber` | reports.view |
| GET | `/api/audit-logs` | audit.view |

Los listados paginados usan `data.data` y `data.current_page`, `data.last_page`, `data.total`. Límite `per_page`: 100. Respuestas correctas: `{success:true,message:...,data:...}`. Errores de validación: 422 y `errors`; credenciales: 401; permiso: 403; inexistente: 404; conflicto: 409. Otros errores utilizan la respuesta JSON de Laravel.

PUT de catálogos requiere los campos obligatorios igual que POST. DELETE desactiva el registro. Los códigos de métodos de pago son inmutables; una actualización cambia nombre/estado conservando el código. Los catálogos de clientes, servicios y productos son compartidos por la cadena; precios, porcentajes y stock pertenecen a cada sucursal.

Fechas de citas/bloqueos: ISO 8601 con zona, ejemplo `2026-11-09T10:00:00-05:00`. Se guardan en UTC. Horarios: hora local de sucursal, días 1=lunes, 7=domingo; no admite turnos cruzando medianoche. Reportes: `from=2026-10-01&to=2026-10-31` inclusive, hasta 366 días; `all_branches=true` requiere reports.global.

Filtros: customers/services/products `q`, `active`; employees `q`, `job_type`; appointments `barber_id`, `status`, `from`, `to` (fin exclusivo); inventory-movements `product_id`; commissions `barber_id`. Los endpoints my-* fuerzan el barbero asociado al usuario y no aceptan consultar otro barbero.

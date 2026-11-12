/*
JOTABARBER - BASE MULTISUCURSAL - Propuesta inicial, 06/10/2026
Motor objetivo: MySQL 8.0.16+ / 8.4, InnoDB, utf8mb4.
Ejecutar UNA VEZ en una base NUEVA seleccionada previamente. No elimina tablas.
Si tu proyecto ya tiene users, NO ejecutes este archivo completo sobre esa base:
convierte el esquema en migraciones y conserva users, sus IDs y contraseñas.

ALCANCE
Una cadena de barberías con varias sucursales; no SaaS para empresas independientes.
Catálogos compartidos, operación/precios/stock/roles separados por sucursal.
Nombres en inglés para facilitar Eloquent; documentación y nombres visibles en español.
Moneda inicial PEN. Fechas operativas DATETIME guardadas en UTC; presentar en
America/Lima. Horarios TIME son hora local de branches.timezone. Dinero DECIMAL.

SEGURIDAD
users = identidad/login. employees = persona y cargo operativo. Un empleado puede
no tener cuenta. Ser barbero no concede acceso: el acceso depende de los roles.
user_branches = locales autorizados. branch_user_roles asigna roles por local.
role_permissions define acciones; menu_items.permission_id define qué permiso
se necesita para ver cada opción. Un menú padre sin permiso aparece únicamente
si contiene hijos visibles. No guardar permisos redundantes por usuario/menu.
Cada petición debe validar usuario activo, membresía activa, sucursal activa,
permiso y alcance del registro. El barbero solo ve sus citas y comisiones: usar
Policies además del permiso. Reportes globales requieren un permiso específico
Y agregación limitada a las sucursales autorizadas del usuario.
El esquema RBAC es propio; NO es el esquema nativo de Spatie Permission.
Auth Sanctum, sesiones, password_reset_tokens y otras tablas técnicas se crean
con las migraciones correspondientes al Laravel/autenticación que ya utilices.

LOGIN Y SUCURSAL
Recomendado: autenticar credenciales -> devolver sucursales autorizadas -> combo
-> POST /auth/select-branch {branch_id} -> permisos y menús de ese local.
Si solo tiene una, seleccionarla automáticamente. También puedes mostrar un
combo antes de ingresar y enviar {username,password,branch_id}; el servidor debe
validar la membresía después de autenticar. Un listado público debe exponer
solo id/nombre/código de locales activos, sin información de usuarios.
Mantener branch_id por sesión o contexto del token, NO como users.current_branch_id
porque un usuario puede abrir sesiones distintas en locales distintos.
Si se recibe X-Branch-Id, validar membresía en CADA request. No confiar en Vite.

REPARTO
branch_services contiene tarifa/duración y porcentajes por local y servicio.
barber_service_rates permite una excepción por barbero/local/servicio.
Los porcentajes suman 100. Al confirmar una venta, copiar precio, descripción,
porcentajes y montos a sale_services; los cambios posteriores no alteran historia.
Base inicial = cantidad * precio - descuento, sin propinas; aquí no se calcula
tributación/facturación electrónica. commission = ROUND(base * barber_pct/100,2);
owner_amount = base - commission. Ingreso del local no equivale a utilidad neta.
Una fila de servicio se atribuye a un único barbero. Dividir filas si trabajan dos.
Por defecto generar comisiones cuando la venta esté COMPLETAMENTE pagada.
No liquidar ventas pendientes ni citas. Las propinas van en payments.tip_amount,
fuera del total y del reparto; su entrega al barbero necesita un flujo adicional.

TRANSACCIONES QUE DEBE IMPLEMENTAR LARAVEL
1. Citas: validar empleado barbero activo, servicio/local activo, horario y bloqueos;
   bloquear employee_branches del barbero con SELECT ... FOR UPDATE, comprobar
   solapamientos (existing.starts_at < new.ends_at AND existing.ends_at > new.starts_at)
   y guardar. Bloquear el mismo registro en cualquier alta/cambio/bloqueo de agenda.
   Validar suma de duraciones, disponibilidad en otros locales y zona horaria.
   Al permitir trabajar simultáneamente en varios locales, bloquear employees en
   lugar de employee_branches y comprobar citas de TODOS los locales del barbero.
2. Venta: cabecera + servicios/productos + cobros + stock dentro de DB::transaction;
   asegurar idempotencia con sales.operation_key y payments.operation_key.
   Validar los totales de detalle contra sales y los cobros contra el total.
   appointment_id es único: una cita genera a lo sumo una venta; clientes deben
   coincidir si se vincula cita. Se permiten clientes anónimos en venta directa.
3. Stock: crear previamente branch_products; bloquear su fila y actualizar stock
   junto con inventory_movements. Cantidad positiva para entrada, negativa salida.
   En productos de venta: una salida por sale_products.id mediante índice único;
   controlar límites/stock y costo aplicado. Movimientos son el kardex y stock_qty
   es saldo cacheado. No editar ni borrar movimientos ya contabilizados.
4. Comisiones: bloquear sale_services y settlement; validar venta pagada no anulada,
   mismo barbero/local y copiar comisión. commission_settlement_items.sale_service_id
   único evita pagar el servicio dos veces. Registrar liquidación y su salida de
   caja en una sola transacción. Una liquidación contabilizada no se edita/elimina.
5. Caja: aperturas/cierres/pagos/gastos/liquidaciones bloquean cash_registers y
   cash_sessions. Máximo una sesión abierta por caja (regla Laravel). Pagos en
   efectivo exigen sesión activa; otros métodos pueden no usar sesión. Efectivo
   esperado = apertura + pagos CASH (incluye propinas) - gastos CASH - comisiones
   CASH. Conteo real y diferencia al cerrar. No modificar operaciones de caja cerrada.
6. Anulaciones: no borrar ventas/cobros. Este MVP conserva cancelled_at/reason;
   inicialmente impedir anular una venta cobrada o con comisión liquidada. Antes
   de habilitar devoluciones implementar registros de reembolso, reversión de
   stock y ajustes de comisión auditables; no basta cambiar status.

Las FKs compuestas refuerzan pertenencia al local. CHECK controla importes,
porcentajes y tiempos simples. Totales entre tablas, cargo de empleado, registros
activos, disponibilidad, estados de flujo y reglas de caja requieren Application
Actions/Policies y transacciones: NO quedan garantizados solo con el SQL.

MODELO / IMPLEMENTACIÓN LARAVEL
Módulos sugeridos: Access, Branches, Staff, Customers, Catalog, Appointments,
Sales, Inventory, Cash y Commissions. Con tu DDD liviano: Domain (VO/Policies),
Application (Actions), Infrastructure (Eloquent repos), Controllers delgados.
IDs BIGINT UNSIGNED compatibles con foreignId(). Agregar casts decimal:2,
datetime y enums de estado. Definir $table cuando Eloquent no infiera el nombre.
No usar SoftDeletes indiscriminadamente: catálogos active=false; movimientos
financieros se conservan/anulan. Las FKs históricas usan RESTRICT por defecto.

ENDPOINTS ORIENTATIVOS (posterior al diseño de base)
GET /me; GET /me/branches; POST /auth/select-branch; GET /me/menu
CRUD /roles, /users, /branches (administración autorizada)
CRUD /employees, /customers, /services, /products
CRUD /branch-services, /branch-products; CRUD /appointments
POST /sales; GET /sales; GET /sales/{id}; POST /sales/{id}/payments
POST /cash-sessions/open; POST /cash-sessions/{id}/close; POST /expenses
GET /commissions/pending; POST /commission-settlements
GET /reports/dashboard?from=...&to=...; GET /reports/by-barber

DATOS INICIALES
Solo roles, permisos, menús y métodos de pago. Sin usuarios/contraseñas demo.
Crear usuario con Hash::make desde Laravel y asignar user_branches + rol.
No hay bypass implícito de superadministrador: admin obtiene permisos explícitos.
Roles iniciales son editables; al crear permisos nuevos asignarlos explícitamente.
Próximas extensiones: compras/proveedores, transferencias de stock, devoluciones,
propinas por barbero, gastos recurrentes, notificaciones/WhatsApp, fidelización,
facturación electrónica, ventas a crédito y múltiples pagos de una liquidación.

IMPORTACIÓN
Crear base desde Workbench/phpMyAdmin: CREATE DATABASE jotabarber CHARACTER SET
utf8mb4 COLLATE utf8mb4_0900_ai_ci; seleccionarla y ejecutar este archivo.
CLI: mysql -u TU_USUARIO -p jotabarber < JOTABARBER_mysql.sql
No lanzar sobre producción con tablas existentes. Elegir SQL inicial O migraciones;
no ejecutar ambos para crear las mismas tablas. Revisado estructuralmente; requiere
prueba de importación en tu MySQL, no se ejecutó contra un servidor MySQL aquí.
*/
SET NAMES utf8mb4;

-- branches
CREATE TABLE branches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(20) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL,
  address VARCHAR(255), phone VARCHAR(30), timezone VARCHAR(60) NOT NULL DEFAULT 'America/Lima',
  currency CHAR(3) NOT NULL DEFAULT 'PEN', active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- users
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(150) NULL UNIQUE, email_verified_at DATETIME NULL,
  password VARCHAR(255) NOT NULL, remember_token VARCHAR(100), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- roles
CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(60) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL, description VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- permissions
CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(150) NOT NULL, module VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- role_permissions
CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL, permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles (id),
  FOREIGN KEY (permission_id) REFERENCES permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- user_branches
CREATE TABLE user_branches (
  user_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (user_id, branch_id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- branch_user_roles
CREATE TABLE branch_user_roles (
  user_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, branch_id, role_id),
  FOREIGN KEY (user_id, branch_id) REFERENCES user_branches (user_id, branch_id),
  FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- menu_items
CREATE TABLE menu_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, parent_id BIGINT UNSIGNED NULL, permission_id BIGINT UNSIGNED NULL,
  code VARCHAR(60) NOT NULL UNIQUE, label VARCHAR(120) NOT NULL, route VARCHAR(150) NULL,
  icon VARCHAR(60), sort_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (parent_id) REFERENCES menu_items (id),
  FOREIGN KEY (permission_id) REFERENCES permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- employees
CREATE TABLE employees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL UNIQUE, first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL, document_type VARCHAR(20) NULL, document_number VARCHAR(30) NULL,
  phone VARCHAR(30), email VARCHAR(150), job_type ENUM('BARBER','RECEPTIONIST','MANAGER','OTHER') NOT NULL,
  hire_date DATE NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (document_type, document_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- employee_branches
CREATE TABLE employee_branches (
  employee_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (employee_id, branch_id),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- customers
CREATE TABLE customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100),
  phone VARCHAR(30), email VARCHAR(150), document_type VARCHAR(20), document_number VARCHAR(30),
  birth_date DATE, notes TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (document_type, document_number),
  INDEX (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- service_categories
CREATE TABLE service_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- services
CREATE TABLE services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id BIGINT UNSIGNED NOT NULL, code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL, description TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES service_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- branch_services
CREATE TABLE branch_services (
  branch_id BIGINT UNSIGNED NOT NULL, service_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(12,2) NOT NULL, duration_minutes SMALLINT UNSIGNED NOT NULL,
  barber_percentage DECIMAL(5,2) NOT NULL, owner_percentage DECIMAL(5,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (branch_id, service_id),
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (service_id) REFERENCES services (id),
  CHECK (price >= 0 AND duration_minutes > 0),
  CHECK (barber_percentage BETWEEN 0 AND 100 AND owner_percentage BETWEEN 0 AND 100 AND barber_percentage + owner_percentage = 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- barber_service_rates
CREATE TABLE barber_service_rates (
  branch_id BIGINT UNSIGNED NOT NULL, employee_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL, barber_percentage DECIMAL(5,2) NOT NULL,
  owner_percentage DECIMAL(5,2) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (branch_id, employee_id, service_id),
  FOREIGN KEY (employee_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  FOREIGN KEY (branch_id, service_id) REFERENCES branch_services (branch_id, service_id),
  CHECK (barber_percentage BETWEEN 0 AND 100 AND owner_percentage BETWEEN 0 AND 100 AND barber_percentage + owner_percentage = 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- barber_schedules
CREATE TABLE barber_schedules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, employee_id BIGINT UNSIGNED NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL COMMENT '1=Lunes, 7=Domingo', starts_at TIME NOT NULL,
  ends_at TIME NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (employee_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  UNIQUE (branch_id, employee_id, weekday, starts_at),
  CHECK (weekday BETWEEN 1 AND 7 AND ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- barber_time_off
CREATE TABLE barber_time_off (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, employee_id BIGINT UNSIGNED NOT NULL,
  starts_at DATETIME NOT NULL, ends_at DATETIME NOT NULL, reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (employee_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  INDEX (branch_id, employee_id, starts_at),
  CHECK (ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- appointments
CREATE TABLE appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, customer_id BIGINT UNSIGNED NOT NULL,
  barber_id BIGINT UNSIGNED NOT NULL, starts_at DATETIME NOT NULL, ends_at DATETIME NOT NULL,
  status ENUM('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
  notes TEXT, cancellation_reason VARCHAR(255), created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id),
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (barber_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  INDEX (branch_id, barber_id, starts_at, ends_at),
  INDEX (branch_id, status, starts_at),
  CHECK (ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- appointment_services
CREATE TABLE appointment_services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, appointment_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL, service_name VARCHAR(150) NOT NULL,
  quoted_price DECIMAL(12,2) NOT NULL, duration_minutes SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (appointment_id, branch_id) REFERENCES appointments (id, branch_id),
  FOREIGN KEY (branch_id, service_id) REFERENCES branch_services (branch_id, service_id),
  CHECK (quoted_price >= 0 AND duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- product_categories
CREATE TABLE product_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- products
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id BIGINT UNSIGNED NOT NULL, sku VARCHAR(60) NOT NULL UNIQUE,
  barcode VARCHAR(80) NULL UNIQUE, name VARCHAR(150) NOT NULL, description TEXT,
  unit VARCHAR(20) NOT NULL DEFAULT 'UND', usage_type ENUM('SALE','INTERNAL','BOTH') NOT NULL DEFAULT 'SALE',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES product_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- branch_products
CREATE TABLE branch_products (
  branch_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL DEFAULT 0, average_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
  stock_qty DECIMAL(12,3) NOT NULL DEFAULT 0, minimum_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (branch_id, product_id),
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (product_id) REFERENCES products (id),
  CHECK (sale_price >= 0 AND average_cost >= 0 AND stock_qty >= 0 AND minimum_stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- cash_registers
CREATE TABLE cash_registers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, name VARCHAR(100) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id),
  UNIQUE (branch_id, name),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- cash_sessions
CREATE TABLE cash_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, cash_register_id BIGINT UNSIGNED NOT NULL,
  opened_by BIGINT UNSIGNED NOT NULL, closed_by BIGINT UNSIGNED NULL,
  opened_at DATETIME NOT NULL, closed_at DATETIME NULL, opening_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  expected_amount DECIMAL(12,2) NULL, counted_amount DECIMAL(12,2) NULL,
  difference_amount DECIMAL(12,2) NULL, status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN' ,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id),
  FOREIGN KEY (cash_register_id, branch_id) REFERENCES cash_registers (id, branch_id),
  FOREIGN KEY (opened_by) REFERENCES users (id),
  FOREIGN KEY (closed_by) REFERENCES users (id),
  INDEX (branch_id, status),
  CHECK (opening_amount >= 0 AND (counted_amount IS NULL OR counted_amount >= 0)),
  CHECK (closed_at IS NULL OR closed_at >= opened_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- sales
CREATE TABLE sales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, customer_id BIGINT UNSIGNED NULL,
  appointment_id BIGINT UNSIGNED NULL UNIQUE, number VARCHAR(30) NOT NULL,
  operation_key CHAR(36) NOT NULL UNIQUE, sold_at DATETIME NOT NULL,
  status ENUM('DRAFT','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0, discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0, notes TEXT, created_by BIGINT UNSIGNED NOT NULL,
  cancelled_by BIGINT UNSIGNED NULL, cancelled_at DATETIME NULL, cancellation_reason VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id),
  UNIQUE (branch_id, number),
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (appointment_id, branch_id) REFERENCES appointments (id, branch_id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  FOREIGN KEY (cancelled_by) REFERENCES users (id),
  INDEX (branch_id, sold_at),
  CHECK (subtotal_amount >= 0 AND discount_amount >= 0 AND discount_amount <= subtotal_amount AND total_amount = subtotal_amount - discount_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- sale_services
CREATE TABLE sale_services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, sale_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL, barber_id BIGINT UNSIGNED NOT NULL,
  service_name VARCHAR(150) NOT NULL, quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL, discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL, barber_percentage DECIMAL(5,2) NOT NULL,
  owner_percentage DECIMAL(5,2) NOT NULL, barber_amount DECIMAL(12,2) NOT NULL,
  owner_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id, barber_id),
  FOREIGN KEY (sale_id, branch_id) REFERENCES sales (id, branch_id),
  FOREIGN KEY (branch_id, service_id) REFERENCES branch_services (branch_id, service_id),
  FOREIGN KEY (barber_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  INDEX (branch_id, barber_id),
  CHECK (quantity > 0 AND unit_price >= 0 AND discount_amount >= 0 AND net_amount >= 0 AND net_amount = quantity * unit_price - discount_amount),
  CHECK (barber_percentage BETWEEN 0 AND 100 AND owner_percentage BETWEEN 0 AND 100 AND barber_percentage + owner_percentage = 100),
  CHECK (barber_amount >= 0 AND owner_amount >= 0 AND barber_amount = ROUND(net_amount * barber_percentage / 100, 2) AND owner_amount + barber_amount = net_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- sale_products
CREATE TABLE sale_products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, sale_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL, product_name VARCHAR(150) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL, unit_price DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(12,4) NOT NULL, discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id, product_id),
  FOREIGN KEY (sale_id, branch_id) REFERENCES sales (id, branch_id),
  FOREIGN KEY (branch_id, product_id) REFERENCES branch_products (branch_id, product_id),
  CHECK (quantity > 0 AND unit_price >= 0 AND unit_cost >= 0 AND discount_amount >= 0 AND net_amount >= 0 AND net_amount = ROUND(quantity * unit_price,2) - discount_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- payment_methods
CREATE TABLE payment_methods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(80) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- payments
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, sale_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  cash_session_id BIGINT UNSIGNED NULL, payment_method_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL, tip_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  reference VARCHAR(150), paid_at DATETIME NOT NULL, created_by BIGINT UNSIGNED NOT NULL,
  operation_key CHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (sale_id, branch_id) REFERENCES sales (id, branch_id),
  FOREIGN KEY (cash_session_id, branch_id) REFERENCES cash_sessions (id, branch_id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  INDEX (branch_id, paid_at),
  CHECK (amount > 0 AND tip_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- inventory_movements
CREATE TABLE inventory_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL,
  sale_product_id BIGINT UNSIGNED NULL UNIQUE,
  type ENUM('OPENING','PURCHASE','SALE','CONSUMPTION','ADJUSTMENT_IN','ADJUSTMENT_OUT','RETURN') NOT NULL,
  quantity_delta DECIMAL(12,3) NOT NULL, unit_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
  occurred_at DATETIME NOT NULL, reason VARCHAR(255), created_by BIGINT UNSIGNED NOT NULL,
  operation_key CHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (branch_id, product_id) REFERENCES branch_products (branch_id, product_id),
  FOREIGN KEY (sale_product_id, branch_id, product_id) REFERENCES sale_products (id, branch_id, product_id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  INDEX (branch_id, product_id, occurred_at),
  CHECK (quantity_delta <> 0 AND unit_cost >= 0),
  CHECK ((type IN ('OPENING','PURCHASE','ADJUSTMENT_IN','RETURN') AND quantity_delta > 0) OR (type IN ('SALE','CONSUMPTION','ADJUSTMENT_OUT') AND quantity_delta < 0)),
  CHECK ((type = 'SALE' AND sale_product_id IS NOT NULL) OR (type <> 'SALE' AND sale_product_id IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- expense_categories
CREATE TABLE expense_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- expenses
CREATE TABLE expenses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, category_id BIGINT UNSIGNED NOT NULL,
  cash_session_id BIGINT UNSIGNED NULL, payment_method_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL, amount DECIMAL(12,2) NOT NULL,
  spent_at DATETIME NOT NULL, reference VARCHAR(100), created_by BIGINT UNSIGNED NOT NULL,
  operation_key CHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (category_id) REFERENCES expense_categories (id),
  FOREIGN KEY (cash_session_id, branch_id) REFERENCES cash_sessions (id, branch_id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  INDEX (branch_id, spent_at),
  CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- commission_settlements
CREATE TABLE commission_settlements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, barber_id BIGINT UNSIGNED NOT NULL,
  period_start DATE NOT NULL, period_end DATE NOT NULL, amount DECIMAL(12,2) NOT NULL,
  status ENUM('DRAFT','PAID') NOT NULL DEFAULT 'DRAFT', paid_at DATETIME NULL,
  payment_method_id BIGINT UNSIGNED NULL, cash_session_id BIGINT UNSIGNED NULL,
  reference VARCHAR(150), notes TEXT, created_by BIGINT UNSIGNED NOT NULL,
  operation_key CHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id, barber_id),
  FOREIGN KEY (barber_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id),
  FOREIGN KEY (cash_session_id, branch_id) REFERENCES cash_sessions (id, branch_id),
  FOREIGN KEY (created_by) REFERENCES users (id),
  INDEX (branch_id, barber_id, period_start, period_end),
  CHECK (period_end >= period_start AND amount >= 0),
  CHECK ((status = 'DRAFT' AND paid_at IS NULL) OR (status = 'PAID' AND paid_at IS NOT NULL AND payment_method_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- commission_settlement_items
CREATE TABLE commission_settlement_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, settlement_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  barber_id BIGINT UNSIGNED NOT NULL, sale_service_id BIGINT UNSIGNED NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (settlement_id, branch_id, barber_id) REFERENCES commission_settlements (id, branch_id, barber_id),
  FOREIGN KEY (sale_service_id, branch_id, barber_id) REFERENCES sale_services (id, branch_id, barber_id),
  CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- audit_logs
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NULL, user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL, entity_type VARCHAR(100) NOT NULL, entity_id BIGINT UNSIGNED NULL,
  old_values JSON NULL, new_values JSON NULL, ip_address VARCHAR(45), occurred_at DATETIME NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  INDEX (entity_type, entity_id),
  INDEX (branch_id, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Catálogos iniciales. Las inserciones son para una base vacía.
START TRANSACTION;
INSERT INTO roles (code,name) VALUES
('admin','Administrador general'),
('manager','Administrador de sucursal'),
('receptionist','Recepcionista'),
('barber','Barbero');
INSERT INTO permissions (code,name,module) VALUES
('dashboard.view','Consultar Panel','dashboard'),
('branches.view','Consultar Sucursales','branches'),
('branches.manage','Administrar Sucursales','branches'),
('users.view','Consultar Usuarios','users'),
('users.manage','Administrar Usuarios','users'),
('roles.view','Consultar Roles y permisos','roles'),
('roles.manage','Administrar Roles y permisos','roles'),
('employees.view','Consultar Personal','employees'),
('employees.manage','Administrar Personal','employees'),
('customers.view','Consultar Clientes','customers'),
('customers.manage','Administrar Clientes','customers'),
('services.view','Consultar Servicios','services'),
('services.manage','Administrar Servicios','services'),
('products.view','Consultar Productos','products'),
('products.manage','Administrar Productos','products'),
('appointments.view','Consultar Citas','appointments'),
('appointments.manage','Administrar Citas','appointments'),
('appointments.view_own','Consultar propios Citas','appointments'),
('sales.view','Consultar Ventas','sales'),
('sales.create','Registrar Ventas','sales'),
('sales.cancel','Anular Ventas','sales'),
('inventory.view','Consultar Inventario','inventory'),
('inventory.manage','Administrar Inventario','inventory'),
('cash.view','Consultar Caja','cash'),
('cash.manage','Administrar Caja','cash'),
('expenses.view','Consultar Gastos','expenses'),
('expenses.manage','Administrar Gastos','expenses'),
('commissions.view','Consultar Comisiones','commissions'),
('commissions.pay','Liquidar Comisiones','commissions'),
('commissions.view_own','Consultar propios Comisiones','commissions'),
('reports.view','Consultar Reportes','reports'),
('reports.global','Consultar todas las sucursales autorizadas Reportes','reports'),
('audit.view','Consultar Auditoría','audit');
INSERT INTO role_permissions (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='admin';
INSERT INTO role_permissions (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='manager' AND p.code IN ('dashboard.view','employees.view','employees.manage','customers.view','customers.manage','services.view','services.manage','products.view','products.manage','appointments.view','appointments.manage','sales.view','sales.create','sales.cancel','inventory.view','inventory.manage','cash.view','cash.manage','expenses.view','expenses.manage','commissions.view','commissions.pay','reports.view');
INSERT INTO role_permissions (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='receptionist' AND p.code IN ('dashboard.view','employees.view','customers.view','customers.manage','services.view','products.view','appointments.view','appointments.manage','sales.view','sales.create','inventory.view','cash.view','cash.manage');
INSERT INTO role_permissions (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='barber' AND p.code IN ('appointments.view_own','commissions.view_own');
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'dashboard','Panel','/dashboard',10,id FROM permissions WHERE code='dashboard.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'branches','Sucursales','/branches',20,id FROM permissions WHERE code='branches.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'users','Usuarios','/users',30,id FROM permissions WHERE code='users.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'roles','Roles y permisos','/roles',40,id FROM permissions WHERE code='roles.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'employees','Personal','/employees',50,id FROM permissions WHERE code='employees.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'customers','Clientes','/customers',60,id FROM permissions WHERE code='customers.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'services','Servicios','/services',70,id FROM permissions WHERE code='services.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'products','Productos','/products',80,id FROM permissions WHERE code='products.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'appointments','Citas','/appointments',90,id FROM permissions WHERE code='appointments.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'sales','Ventas','/sales',100,id FROM permissions WHERE code='sales.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'inventory','Inventario','/inventory',110,id FROM permissions WHERE code='inventory.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'cash','Caja','/cash',120,id FROM permissions WHERE code='cash.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'expenses','Gastos','/expenses',130,id FROM permissions WHERE code='expenses.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'commissions','Comisiones','/commissions',140,id FROM permissions WHERE code='commissions.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'reports','Reportes','/reports',150,id FROM permissions WHERE code='reports.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'audit','Auditoría','/audit',160,id FROM permissions WHERE code='audit.view';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'appointments_own','Mis citas','/my-appointments',200,id FROM permissions WHERE code='appointments.view_own';
INSERT INTO menu_items (code,label,route,sort_order,permission_id) SELECT 'commissions_own','Mis comisiones','/my-commissions',200,id FROM permissions WHERE code='commissions.view_own';
INSERT INTO payment_methods (code,name) VALUES ('CASH','Efectivo'),('CARD','Tarjeta'),('YAPE','Yape'),('PLIN','Plin'),('TRANSFER','Transferencia');
COMMIT;

/* CONSULTAS DE REFERENCIA (activar manualmente con parámetros reales)
-- Sucursales autorizadas después de autenticar:
SELECT b.id,b.code,b.name FROM user_branches ub
JOIN branches b ON b.id=ub.branch_id
WHERE ub.user_id=:user_id AND ub.active=1 AND b.active=1;

-- Permisos efectivos del usuario en el local:
SELECT DISTINCT p.code FROM branch_user_roles bur
JOIN user_branches ub ON ub.user_id=bur.user_id AND ub.branch_id=bur.branch_id
JOIN role_permissions rp ON rp.role_id=bur.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE bur.user_id=:user_id AND bur.branch_id=:branch_id AND ub.active=1;
-- Agregar la validación de users.active y branches.active en middleware.

-- Comisión pendiente (venta confirmada y completamente cobrada; sin liquidación):
SELECT ss.id,ss.barber_id,ss.service_name,s.sold_at,ss.net_amount,ss.barber_amount
FROM sale_services ss JOIN sales s ON s.id=ss.sale_id AND s.branch_id=ss.branch_id
LEFT JOIN (SELECT sale_id,SUM(amount) paid FROM payments GROUP BY sale_id) p ON p.sale_id=s.id
LEFT JOIN commission_settlement_items csi ON csi.sale_service_id=ss.id
WHERE ss.branch_id=:branch_id AND ss.barber_id=:barber_id AND s.status='CONFIRMED'
  AND COALESCE(p.paid,0)>=s.total_amount AND csi.id IS NULL;
-- El proceso real usa locks, no únicamente esta consulta de lectura.

-- Ventas y reparto por barbero (fechas en UTC, intervalo final exclusivo):
SELECT ss.barber_id,SUM(ss.net_amount) service_sales,
 SUM(ss.barber_amount) barber_earned,SUM(ss.owner_amount) owner_share
FROM sale_services ss JOIN sales s ON s.id=ss.sale_id AND s.branch_id=ss.branch_id
WHERE s.branch_id=:branch_id AND s.status='CONFIRMED'
AND s.sold_at>=:from_utc AND s.sold_at<:to_utc GROUP BY ss.barber_id;
-- Esto mide ventas/comisiones generadas. Cobros se reportan por payments.paid_at;
-- egresos por expenses.spent_at y commission_settlements.paid_at. No confundirlos.
*/

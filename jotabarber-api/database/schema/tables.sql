CREATE TABLE branches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(20) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL,
  address VARCHAR(255), phone VARCHAR(30), timezone VARCHAR(60) NOT NULL DEFAULT 'America/Lima',
  currency CHAR(3) NOT NULL DEFAULT 'PEN', active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(150) NULL UNIQUE, email_verified_at DATETIME NULL,
  password VARCHAR(255) NOT NULL, remember_token VARCHAR(100), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(60) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL, description VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(150) NOT NULL, module VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL, permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles (id),
  FOREIGN KEY (permission_id) REFERENCES permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_branches (
  user_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (user_id, branch_id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE branch_user_roles (
  user_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, branch_id, role_id),
  FOREIGN KEY (user_id, branch_id) REFERENCES user_branches (user_id, branch_id),
  FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE menu_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, parent_id BIGINT UNSIGNED NULL, permission_id BIGINT UNSIGNED NULL,
  code VARCHAR(60) NOT NULL UNIQUE, label VARCHAR(120) NOT NULL, route VARCHAR(150) NULL,
  icon VARCHAR(60), sort_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (parent_id) REFERENCES menu_items (id),
  FOREIGN KEY (permission_id) REFERENCES permissions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE employees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL UNIQUE, first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL, document_type VARCHAR(20) NULL, document_number VARCHAR(30) NULL,
  phone VARCHAR(30), email VARCHAR(150), job_type ENUM('BARBER','RECEPTIONIST','MANAGER','OTHER') NOT NULL,
  hire_date DATE NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (document_type, document_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE employee_branches (
  employee_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (employee_id, branch_id),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100),
  phone VARCHAR(30), email VARCHAR(150), document_type VARCHAR(20), document_number VARCHAR(30),
  birth_date DATE, notes TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (document_type, document_number),
  INDEX (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE service_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id BIGINT UNSIGNED NULL, code VARCHAR(30) NULL UNIQUE,
  name VARCHAR(150) NOT NULL, description TEXT, price DECIMAL(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE, commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE barber_schedules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, employee_id BIGINT UNSIGNED NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL COMMENT '1=Lunes, 7=Domingo', starts_at TIME NOT NULL,
  ends_at TIME NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (employee_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  UNIQUE (branch_id, employee_id, weekday, starts_at),
  CHECK (weekday BETWEEN 1 AND 7 AND ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE barber_time_off (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, employee_id BIGINT UNSIGNED NOT NULL,
  starts_at DATETIME NOT NULL, ends_at DATETIME NOT NULL, reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (employee_id, branch_id) REFERENCES employee_branches (employee_id, branch_id),
  INDEX (branch_id, employee_id, starts_at),
  CHECK (ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE appointment_services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, appointment_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL, service_name VARCHAR(150) NOT NULL,
  quoted_price DECIMAL(12,2) NOT NULL, duration_minutes SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (appointment_id, branch_id) REFERENCES appointments (id, branch_id),
  FOREIGN KEY (branch_id, service_id) REFERENCES branch_services (branch_id, service_id),
  CHECK (quoted_price >= 0 AND duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id BIGINT UNSIGNED NOT NULL, sku VARCHAR(60) NOT NULL UNIQUE,
  barcode VARCHAR(80) NULL UNIQUE, name VARCHAR(150) NOT NULL, description TEXT,
  unit VARCHAR(20) NOT NULL DEFAULT 'UND', usage_type ENUM('SALE','INTERNAL','BOTH') NOT NULL DEFAULT 'SALE',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES product_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE cash_registers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NOT NULL, name VARCHAR(100) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE (id, branch_id),
  UNIQUE (branch_id, name),
  FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE payment_methods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(80) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE expense_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE commission_settlement_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, settlement_id BIGINT UNSIGNED NOT NULL, branch_id BIGINT UNSIGNED NOT NULL,
  barber_id BIGINT UNSIGNED NOT NULL, sale_service_id BIGINT UNSIGNED NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL, updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (settlement_id, branch_id, barber_id) REFERENCES commission_settlements (id, branch_id, barber_id),
  FOREIGN KEY (sale_service_id, branch_id, barber_id) REFERENCES sale_services (id, branch_id, barber_id),
  CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, branch_id BIGINT UNSIGNED NULL, user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL, entity_type VARCHAR(100) NOT NULL, entity_id BIGINT UNSIGNED NULL,
  old_values JSON NULL, new_values JSON NULL, ip_address VARCHAR(45), occurred_at DATETIME NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  INDEX (entity_type, entity_id),
  INDEX (branch_id, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

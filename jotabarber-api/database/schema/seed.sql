INSERT INTO roles (code,name) VALUES
('admin','Administrador general'),
('manager','Administrador de sucursal'),
('receptionist','Recepcionista'),
('barber','Barbero');
INSERT INTO permissions (code,name,module) VALUES
('dashboard.view','Consultar Panel','Panel'),
('branches.view','Consultar Sucursales','Sucursales'),
('branches.manage','Administrar Sucursales','Sucursales'),
('users.view','Consultar Usuarios','Usuarios'),
('users.manage','Administrar Usuarios','Usuarios'),
('roles.view','Consultar Roles y permisos','Roles'),
('roles.manage','Administrar Roles y permisos','Roles'),
('employees.view','Consultar Personal','Personal'),
('employees.manage','Administrar Personal','Personal'),
('customers.view','Consultar Clientes','Clientes'),
('customers.manage','Administrar Clientes','Clientes'),
('services.view','Consultar Servicios','Servicios'),
('services.manage','Administrar Servicios','Servicios'),
('products.view','Consultar Productos','Productos'),
('products.manage','Administrar Productos','Productos'),
('appointments.view','Consultar Citas','Citas'),
('appointments.manage','Administrar Citas','Citas'),
('appointments.view_own','Consultar propios Citas','Citas'),
('sales.view','Consultar Ventas','Ventas'),
('sales.create','Registrar Ventas','Ventas'),
('sales.cancel','Anular Ventas','Ventas'),
('inventory.view','Consultar Inventario','Inventario'),
('inventory.manage','Administrar Inventario','Inventario'),
('cash.view','Consultar Caja','Caja'),
('cash.manage','Administrar Caja','Caja'),
('expenses.view','Consultar Gastos','Gastos'),
('expenses.manage','Administrar Gastos','Gastos'),
('commissions.view','Consultar Comisiones','Comisiones'),
('commissions.pay','Liquidar Comisiones','Comisiones'),
('commissions.view_own','Consultar propios Comisiones','Comisiones'),
('reports.view','Consultar Reportes','Reportes'),
('reports.global','Consultar todas las sucursales autorizadas Reportes','Reportes'),
('audit.view','Consultar Auditoría','Auditoría');
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

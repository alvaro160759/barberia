# Hand-off de la migración de barbería

## Referencia

- Repositorio: https://github.com/alvaro160759/barberia.git
- Rama actual: `main`
- Último commit analizado: `14209f1` — `Realizacion Citas por horarios, disponibilidad, filtro de barbero para reserva, mejoras en calendario y gestion de confirmacion de reserva a servicios`
- La copia local estaba limpia al hacer este documento. Antes de continuar, el otro programador debe hacer `git pull` y confirmar que `main` local coincide con `origin/main`.

## Alcance incluido en el último commit

El cambio principal conecta las reservas y la venta de servicios con los horarios de los barberos:

- Horario semanal por empleado/barbero y excepciones de tiempo libre (`barber_time_off`).
- Intervalo de agenda configurable por empleado (`slot_interval_minutes`: 30, 40 o 60 minutos).
- Disponibilidad pública por sucursal, barbero, fecha y servicio.
- Filtro de barbero en la reserva pública y en el flujo de ventas.
- Calendario de citas mejorado y flujo para convertir una reserva en servicio/venta.
- Nuevas pantallas y acciones del frontend para administrar horarios y ausencias.
- Seeder para registros de caja.

## Base de datos: pasos obligatorios

La migración toca primero `branches` y luego mueve el intervalo a `employees`. **No** crea `barber_time_off` en estas migraciones: la tabla se espera en el esquema existente. Antes de desplegar, el responsable debe confirmar que la base de producción coincide con el esquema que documenta `jotabarber-api/database/schema/` y hacer respaldo completo.

Desde `jotabarber-api`, después de revisar el respaldo:

```bash
php artisan migrate --force
php artisan db:seed --class=CashRegistersSeeder
php artisan migrate:status
php artisan route:list --path=api
```

No ejecutar `migrate:fresh` ni `migrate:fresh --seed` en una base con datos reales. `CashRegistersSeeder` debe revisarse antes de ejecutarlo en producción: verifica que no duplique ni sobrescriba cajas reales. Si las cajas ya fueron creadas manualmente, omitir ese seeder y validar los registros existentes.

El estado de las migraciones de este commit debe quedar así:

- `2026_11_19_000001_add_slot_interval_minutes_to_branches_table`
- `2026_11_19_000002_move_slot_interval_minutes_to_employees_table`

Después de ambas, `employees.slot_interval_minutes` debe existir con valor predeterminado `60`; `branches.slot_interval_minutes` no debe existir. La migración de `employees` usa `60` por defecto para registros existentes; el frontend restringe nuevas configuraciones a 30, 40 o 60.

## Endpoints nuevos o afectados

### Público (sin autenticación)

- `GET /api/public/barbers`
- `GET /api/public/schedules`
- `POST /api/public/appointments`
- `GET /api/public/dni/{dni}`
- `GET /api/public/branches`
- `GET /api/public/services`

`/api/public/schedules` acepta parámetros de sucursal, barbero, fecha y servicio, y devuelve los horarios disponibles considerando horario semanal, tiempo libre y citas activas. Los documentos exactos de entrada/salida están en `docs/ENDPOINTS.md` y en `jotabarber-api/app/Http/Controllers/PublicBookingController.php`.

### Autenticado con sucursal seleccionada

- `GET /api/schedules/barber`
- `POST /api/schedules/barber`
- `DELETE /api/schedules/barber/{id}`
- `GET /api/schedules/barber/time-off`
- `POST /api/schedules/barber/time-off`
- `DELETE /api/schedules/barber/time-off/{id}`
- `GET /api/schedules/settings?employee_id=...`
- `PUT /api/schedules/settings`

Permisos: consulta con `employees.view`; creación, edición de intervalo y eliminación con `employees.manage`. La reserva pública no requiere token, pero debe validar los mismos límites de disponibilidad del backend.

## Configuración del frontend

No hay `.env.example` en `jotabarber-front`. Crear `.env.local` a partir de las variables usadas en `src/config-global.js`. Para la integración local relevante:

```dotenv
VITE_SERVER_URL=/api
VITE_BASE_PATH=/jotabarber
```

El servidor Vite está en el puerto `3030` y tiene proxy de `/api` hacia `http://localhost:8000` (`jotabarber-front/vite.config.js`). En producción, configurar la URL real de la API y revisar CORS, cookies/CSRF, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS` y `SESSION_SECURE_COOKIE` en el backend.

## Instalación y verificación

### Backend

Requisitos indicados por el proyecto: PHP 8.3+ 64 bits, Composer 2, MySQL 8.0.16+ (recomendado 8.4), extensiones PDO/MySQL y las requeridas por Laravel 13.

```bash
cd jotabarber-api
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan jotabarber:admin
php artisan test
```

Para pruebas de integración usar una base separada terminada en `_testing`, como indica `jotabarber-api/README.md`. No ejecutar pruebas destructivas contra la base real.

### Frontend

Node.js 20.x es la versión recomendada por el README. El proyecto utiliza Yarn en sus scripts, aunque también documenta npm.

```bash
cd jotabarber-front
yarn install
yarn dev
```

Comandos útiles:

```bash
yarn typecheck
yarn lint
yarn build
```

El frontend tiene componentes `.jsx` y `.tsx` mezclados; `yarn typecheck` solo cubre TypeScript y no reemplaza ESLint ni una prueba manual de los flujos JSX.

## Pruebas funcionales mínimas antes de producción

1. Crear/editar horario semanal de un barbero y confirmar que aparece solo en su sucursal.
2. Registrar una ausencia y comprobar que no se ofrecen horarios que coincidan con ella.
3. Cambiar intervalo a 30, 40 y 60 minutos; verificar que la disponibilidad y las citas respetan el intervalo.
4. Reservar desde la web pública con y sin barbero específico.
5. Intentar una reserva fuera de horario, durante tiempo libre o con solapamiento; el backend debe rechazarla.
6. Convertir una reserva confirmada en servicio/venta y comprobar cliente, barbero, sucursal, fecha y comisión.
7. Revisar calendario de citas, cambio de estado y vista de lista.
8. Probar login, selección de sucursal y permisos de un usuario sin `employees.manage`.
9. Confirmar que `php artisan migrate:status` no tiene migraciones pendientes y que `/api/public/schedules` responde sin errores.

## Riesgos y puntos a confirmar

- Confirmar el estado real de `origin/main`; este hand-off se basa en el commit local `14209f1`.
- Hacer respaldo y revisar las migraciones antes de aplicarlas en producción.
- Revisar `CashRegistersSeeder` antes de sembrar datos en producción.
- Confirmar que `barber_time_off`, `barber_schedules` y `employees` existen con las columnas esperadas.
- Las pruebas automatizadas y la instalación real no fueron ejecutadas como parte de este hand-off; deben ejecutarse en el entorno del otro programador antes del despliegue.
- El README del frontend conserva instrucciones de una plantilla Minimals; prevalecen `package.json`, `vite.config.js` y la configuración real del proyecto.

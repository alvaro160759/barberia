# JOTABARBER API

Backend REST para una cadena de barberías con varias sucursales: Laravel 13, MySQL 8.0.16+ (recomendado 8.4), Sanctum, PHP 8.3+ de 64 bits. Extensiones: bcmath, PDO/mysql y las requeridas por Laravel (ctype, curl, DOM, fileinfo, filter, hash, mbstring, openssl, pcre, session, tokenizer, xml). Composer 2.

## Instalación en una base NUEVA

1. Extrae la carpeta y abre una terminal dentro de `jotabarber-api`.
2. Ejecuta `composer install`. Este paquete no incluye vendor ni composer.lock; la primera instalación resolverá dependencias. Conserva y versiona el lock generado para tus siguientes despliegues.
3. Copia `.env.example` a `.env` (Windows: `copy .env.example .env`; Linux: `cp .env.example .env`).
4. Crea en MySQL una base vacía `jotabarber` con utf8mb4 y configura DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD.
5. Ejecuta:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan jotabarber:admin
php artisan route:list --path=api
php artisan serve --host=127.0.0.1 --port=8000
```

El comando admin solicita usuario, nombre y contraseña (mínimo 12 caracteres). Crea Centro si no existe y asigna el administrador a las sucursales activas. No existe contraseña predeterminada.

## Si YA importaste nuestro SQL de 35 tablas

Haz un respaldo, verifica que es exactamente el SQL incluido y establece `ALLOW_EXISTING_SCHEMA=true` antes de `migrate --seed`. La primera migración reconoce el esquema completo sin recrearlo; las siguientes agregan tablas de autenticación y hashes de operación. Después cambia el valor a false. No uses esta opción con un esquema parcial ni con una tabla users distinta. Si tienes un login previo en otro proyecto, integra sus usuarios mediante una migración revisada; este ZIP es un proyecto independiente.

El rollback de la primera migración se bloquea intencionalmente para proteger esquemas adoptados. No uses migrate:fresh sobre datos reales.

## Autenticación y Vite

Para SPA, abre Vite en http://localhost:5173 y API en http://localhost:8000. Usa el mismo hostname (no mezcles localhost y 127.0.0.1). Configura FRONTEND_URL y SANCTUM_STATEFUL_DOMAINS. `examples/vite-auth.ts` contiene un cliente Axios con cookies y CSRF.

Primero GET /sanctum/csrf-cookie, luego POST /api/auth/login con username/password. La respuesta devuelve las sucursales asignadas; si hay varias muestra el combo y envía POST /api/auth/branch. Finalmente GET /api/auth/menu devuelve permisos y árbol de menús. La sucursal pertenece a la sesión; nunca se confía en branch_id enviado en una venta. Dos pestañas del mismo navegador comparten la sesión y sucursal; para sucursales simultáneas utiliza perfiles de navegador o tokens distintos.

Para Postman, usa POST /api/auth/token. El token se asocia a su propia sucursal y expira según config/jotabarber.php. Guarda Bearer token; POST /auth/branch cambia solo su contexto. Importa docs/JOTABARBER.postman_collection.json, configura username/password y IDs. Los cuerpos son ejemplos: sustituye IDs con registros creados en tu base.

## Estructura

- routes/api.php: endpoints y permisos.
- app/Http/Controllers: validación y respuestas.
- app/Application: Actions transaccionales para citas, ventas, cobros, inventario y comisiones.
- app/Support: sucursal, acceso, caja, importes, auditoría e idempotencia.
- database/schema: SQL original, tablas y datos iniciales.
- docs/ENDPOINTS.md: listado completo de rutas.
- tests: pruebas unitarias y de integración MySQL.

## Flujo operativo

Crea categorías y catálogos; asigna servicios a sucursal con precio/duración y reparto que suma 100; registra personal y horarios; registra clientes y citas; crea ventas con servicios/productos; registra cobros; consulta commissions/pending y paga liquidaciones. Para efectivo crea una caja y abre su sesión antes de cobrar, gastar o pagar comisiones.

Los precios y porcentajes se obtienen del servidor y se conservan en cada venta. La comisión se aplica al neto después del descuento, excluyendo propina; el residual redondeado pertenece al local. La parte del local no es utilidad neta. Solo se liquidan servicios de ventas confirmadas completamente cobradas. Fechas operativas UTC, períodos de reportes según zona de sucursal.

operation_key es un UUID por venta/cobro/ajuste/gasto/liquidación. Reenvía el mismo UUID con el mismo cuerpo para recuperar la operación previa; una clave con cuerpo distinto devuelve 409. Solicitudes simultáneas con la misma clave pueden devolver conflicto; vuelve a consultar/reintentar después de que termine la primera. No generes otra clave para reintentar una operación incierta.

## Pruebas y verificación

Este entorno de generación no dispone de PHP, Composer ni MySQL: no se ejecutaron composer install, Artisan, PHPUnit ni la importación real MySQL. La revisión estática y las comprobaciones secundarias del esquema no sustituyen estas pruebas. El proyecto requiere ejecutar los pasos siguientes antes de usarlo en producción.

Crea una base SEPARADA llamada jotabarber_testing. Copia .env a .env.testing, cambia APP_ENV=testing y DB_DATABASE=jotabarber_testing (y credenciales si corresponde). Mantén APP_KEY válido y CACHE_STORE=array. Luego:

```bash
php artisan config:clear
php artisan migrate --seed --env=testing
php artisan test
```

Las pruebas de integración usan transacciones y se niegan a operar si el nombre de base no termina en _testing. Incluyen acceso por sucursal, privacidad del barbero, cálculo e historial de comisiones, reintentos, stock y rollback, citas superpuestas y doble liquidación. Antes de publicar confirma instalación, listado de rutas y suite en tu servidor.

## Alcance y límites

Catálogos compartidos y operaciones por sucursal; los permisos para modificar catálogos compartidos afectan toda la cadena. Reserva permisos de usuarios/roles/menús para administradores de confianza; roles y menús son globales. Desactivar una cuenta afecta todas sus sucursales; para retirar acceso local usa user-branches. El comando admin es de recuperación para operadores con acceso al servidor.

No incluye frontend completo, comprobantes electrónicos SUNAT, devoluciones de ventas cobradas, compras a proveedores, transferencias entre locales, envío de recordatorios, recuperación pública de contraseña ni reparto de propinas. Una venta con cobros no puede anularse. El costo medio de inventario se actualiza con apertura/compra; devoluciones por anulación restauran cantidad manteniendo el costo promedio actual. Cualquier política contable distinta requiere ajustar ese flujo.

En producción configura APP_DEBUG=false, HTTPS, SESSION_SECURE_COOKIE=true y dominios reales; sirve public/ como raíz web. Las operaciones son síncronas; no se requiere un worker para los endpoints incluidos. No se incluyen datos ni secretos de una instalación real.

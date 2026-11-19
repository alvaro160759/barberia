<?php

namespace App\Http\Controllers;

use App\Application\Appointments\SaveAppointment;
use App\Support\{Api, Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PublicBookingController extends Controller
{
    public function branches(Request $r)
    {
        return Api::ok(DB::table('branches')->where('active', true)->select('id', 'name', 'address', 'phone')->orderBy('name')->get());
    }
    public function barbers(Request $r)
    {
        $d = $r->validate([
            'branch_id' => 'required|integer|exists:branches,id',
            'date' => 'nullable|date',
        ]);
        $branchId = (int) $d['branch_id'];
        $zone = DB::table('branches')->where('id', $branchId)->value('timezone') ?? 'America/Lima';
        try {
            $date = \Carbon\CarbonImmutable::parse($d['date'] ?? 'now', $zone)->setTimezone($zone);
        } catch (\Exception $e) {
            $date = \Carbon\CarbonImmutable::now($zone);
        }
        $dayStartUtc = $date->copy()->startOfDay()->utc();
        $dayEndUtc = $dayStartUtc->addDay();
        $weekday = $date->dayOfWeekIso;
        return Api::ok(DB::table('employees as e')
            ->join('employee_branches as eb', 'eb.employee_id', '=', 'e.id')
            ->where('eb.branch_id', $branchId)
            ->where('e.job_type', 'BARBER')
            ->where('e.active', true)
            ->where('eb.active', true)
            // Solo barberos con turno configurado ese día de la semana
            ->whereExists(function ($q) use ($branchId, $weekday) {
                $q->select(DB::raw(1))
                    ->from('barber_schedules as bs')
                    ->whereColumn('bs.employee_id', 'e.id')
                    ->where('bs.branch_id', $branchId)
                    ->where('bs.weekday', $weekday)
                    ->where('bs.active', true);
            })
            // Excluir barberos con permiso/bloqueo ese día
            ->whereNotExists(function ($q) use ($branchId, $dayStartUtc, $dayEndUtc) {
                $q->select(DB::raw(1))
                    ->from('barber_time_off as bto')
                    ->whereColumn('bto.employee_id', 'e.id')
                    ->where('bto.branch_id', $branchId)
                    ->where('bto.starts_at', '<', $dayEndUtc)
                    ->where('bto.ends_at', '>', $dayStartUtc);
            })
            ->select('e.id', 'e.first_name', 'e.last_name', 'e.phone')
            ->orderBy('e.first_name')
            ->get());
    }
    public function services(Request $r)
    {
        $d = $r->validate(['branch_id' => 'required|integer|exists:branches,id']);
        return Api::ok(DB::table('services')
            ->where('active', true)
            ->select('id', 'name', 'price', 'duration_minutes')
            ->orderBy('name')
            ->get());
    }
    public function schedules(Request $r)
    {
        $d = $r->validate([
            'branch_id' => 'required|integer|exists:branches,id',
            'barber_id' => 'required|integer|exists:employees,id',
            'date' => 'required|string',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'integer|distinct',
        ]);
        $branchRow = DB::table('branches')->where('id', $d['branch_id'])->first();
        $zone = $branchRow->timezone ?? 'America/Lima';
        try {
            $date = \Carbon\CarbonImmutable::parse($d['date'], $zone)->setTimezone($zone)->startOfDay();
        } catch (\Exception $e) {
            return Api::error('Formato de fecha inválido', 422);
        }
        $branchId = $d['branch_id'];
        $barberId = $d['barber_id'];
        $barberRow = DB::table('employees')->where('id', $barberId)->first(['slot_interval_minutes']);
        $slotInterval = max(5, (int) ($barberRow->slot_interval_minutes ?? 60));
        $durationMinutes = 30;
        if (!empty($d['service_ids'])) {
            $serviceIds = array_values(array_unique(array_map('intval', $d['service_ids'])));
            $serviceRows = DB::table('services')
                ->where('active', true)
                ->whereIn('id', $serviceIds)
                ->get(['id', 'duration_minutes']);
            if ($serviceRows->count() !== count($serviceIds)) {
                return Api::error('Hay un servicio no disponible.', 422);
            }
            $durationMinutes = max(1, (int) $serviceRows->sum('duration_minutes'));
        }
        $dayStartUtc = $date->utc();
        $dayEndUtc = $date->addDay()->utc();

        // Verificar que el barbero esté asociado a la sucursal
        $barberExists = DB::table('employee_branches')
            ->where('branch_id', $branchId)
            ->where('employee_id', $barberId)
            ->where('active', true)
            ->exists();

        if (!$barberExists) {
            return Api::error('El barbero no está asociado a esta sucursal', 404);
        }

        $existingAppointments = DB::table('appointments')
            ->where('branch_id', $branchId)
            ->where('barber_id', $barberId)
            ->where('starts_at', '>=', $dayStartUtc)
            ->where('starts_at', '<', $dayEndUtc)
            ->where('status', '!=', 'CANCELLED')
            ->where('status', '!=', 'NO_SHOW')
            ->get(['starts_at', 'ends_at']);
        $baseSchedules = DB::table('barber_schedules')
            ->where('branch_id', $branchId)
            ->where('employee_id', $barberId)
            ->where('weekday', $date->dayOfWeekIso)
            ->where('active', true)
            ->get();
        $timeOff = DB::table('barber_time_off')
            ->where('branch_id', $branchId)
            ->where('employee_id', $barberId)
            ->where('starts_at', '<', $dayEndUtc)
            ->where('ends_at', '>', $dayStartUtc)
            ->exists();
        if ($timeOff) {
            return Api::ok([]);
        }
        $availableSlots = [];
        $now = \Carbon\CarbonImmutable::now($zone);
        foreach ($baseSchedules as $schedule) {
            $start = $date->setTimeFromTimeString($schedule->starts_at);
            $end = $date->setTimeFromTimeString($schedule->ends_at);
            $current = $start;
            while ($current->copy()->addMinutes($slotInterval)->lte($end)) {
                if ($current->lte($now)) {
                    $current = $current->addMinutes($slotInterval);
                    continue;
                }
                $slotStart = $current->format('H:i');
                $slotEnd = $current->copy()->addMinutes($durationMinutes)->format('H:i');
                $slotStartCarbon = $current;
                $slotEndCarbon = $current->addMinutes($durationMinutes);
                $isAvailable = $slotEndCarbon->lte($end);
                foreach ($existingAppointments as $appointment) {
                    $appointmentStart = \Carbon\CarbonImmutable::parse($appointment->starts_at);
                    $appointmentEnd = \Carbon\CarbonImmutable::parse($appointment->ends_at);
                    if ($slotStartCarbon->lt($appointmentEnd) && $slotEndCarbon->gt($appointmentStart)) {
                        $isAvailable = false;
                        break;
                    }
                }
                $availableSlots[] = [
                    'time' => $slotStart,
                    'available' => $isAvailable
                ];
                $current = $current->addMinutes($slotInterval);
            }
        }
        return Api::ok($availableSlots);
    }
    public function dni(string $dni)
    {
        if (!preg_match('/^\d{8}$/', $dni)) {
            return Api::error('El DNI debe tener 8 dígitos.', 422);
        }
        $local = DB::table('customers')
            ->where('document_type', 'DNI')
            ->where('document_number', $dni)
            ->where('active', true)
            ->first(['first_name', 'last_name']);
        if ($local) {
            $fullName = trim($local->first_name . ' ' . ($local->last_name ?? ''));
            return Api::ok([
                'dni' => $dni,
                'full_name' => $fullName,
                'first_name' => $local->first_name,
                'last_name' => $local->last_name,
            ]);
        }
        $token = config('jotabarber.apisperu_token');
        if (!$token) {
            return Api::error('El servicio de consulta de DNI no está configurado.', 500);
        }
        try {
            $response = Http::timeout(10)->get("https://dniruc.apisperu.com/api/v1/dni/{$dni}", [
                'token' => $token,
            ]);
        } catch (\Throwable $e) {
            return Api::error('No se pudo consultar el DNI.', 502);
        }
        if (!$response->successful()) {
            return Api::error('No se encontró información para ese DNI.', 404);
        }
        $data = $response->json() ?? [];
        $firstName = $data['nombres'] ?? $data['nombres_completos'] ?? null;
        $lastName = trim(
            ($data['apellidoPaterno'] ?? $data['apellido_paterno'] ?? '') . ' ' .
            ($data['apellidoMaterno'] ?? $data['apellido_materno'] ?? '')
        ) ?: null;
        $fullName = $data['nombre_completo'] ?? $data['nombreCompleto'] ?? trim(($firstName ?? '') . ' ' . ($lastName ?? ''));
        if (!$fullName) {
            return Api::error('No se encontró información para ese DNI.', 404);
        }
        return Api::ok([
            'dni' => $dni,
            'full_name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
        ]);
    }
    public function store(Request $r, SaveAppointment $action)
    {
        $d = $r->validate([
            'branch_id' => 'required|integer|exists:branches,id',
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:30',
            'customer_email' => 'nullable|email|max:150',
            'customer_dni' => 'nullable|string|regex:/^\d{8}$/',
            'barber_id' => 'required|integer|exists:employees,id',
            'starts_at' => ['required', 'date', 'regex:/(Z|[+-]\d{2}:\d{2})$/'],
            'service_ids' => 'required|array|min:1|max:20',
            'service_ids.*' => 'required|integer|distinct',
            'notes' => 'nullable|string|max:2000'
        ]);
        return DB::transaction(function () use ($r, $d, $action) {
            $userId = DB::table('users')->where('active', true)->orderBy('id')->value('id');
            if (!$userId) {
                return Api::error('No hay usuarios configurados para registrar la reserva.', 500);
            }
            $nameParts = preg_split('/\s+/', trim($d['customer_name']), 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? null;
            $dni = $d['customer_dni'] ?? null;
            $documentTaken = $dni && DB::table('customers')
                ->where('document_type', 'DNI')
                ->where('document_number', $dni)
                ->exists();
            $customer = DB::table('customers')->where('phone', $d['customer_phone'])->first();
            if (!$customer) {
                $customerId = DB::table('customers')->insertGetId([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $d['customer_phone'],
                    'email' => $d['customer_email'] ?? null,
                    'document_type' => $dni && !$documentTaken ? 'DNI' : null,
                    'document_number' => $dni && !$documentTaken ? $dni : null,
                    'active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $customerId = $customer->id;
                DB::table('customers')->where('id', $customerId)->update([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $d['customer_email'] ?? $customer->email,
                    'document_type' => $dni && !$documentTaken ? 'DNI' : $customer->document_type,
                    'document_number' => $dni && !$documentTaken ? $dni : $customer->document_number,
                    'updated_at' => now()
                ]);
            }
            $appointmentData = [
                'customer_id' => $customerId,
                'barber_id' => $d['barber_id'],
                'starts_at' => $d['starts_at'],
                'service_ids' => $d['service_ids'],
                'notes' => $d['notes'] ?? null
            ];
            $appointment = $action->execute($appointmentData, $d['branch_id'], $userId, null);
            return Api::ok($appointment, 'Reserva creada exitosamente.', 201);
        }, 3);
    }
}

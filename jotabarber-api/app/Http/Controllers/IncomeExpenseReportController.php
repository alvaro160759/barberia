<?php
namespace App\Http\Controllers;
use App\Support\{Access,Api,Money};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class IncomeExpenseReportController extends Controller {
    public function index(Request $r) {
        $branchId = $r->filled('branch_id') ? (int)$r->input('branch_id') : $this->branch($r);
        if($r->filled('branch_id')) Access::require($this->user($r),$this->branch($r),'reports.global');

        $from = $r->input('from');
        $to = $r->input('to');

        // Ingresos totales
        $totalIncome = DB::table('payments')
            ->where('branch_id', $branchId)
            ->when($from, fn($q) => $q->where('paid_at', '>=', $from))
            ->when($to, fn($q) => $q->where('paid_at', '<=', $to . ' 23:59:59'))
            ->sum(DB::raw('amount + tip_amount'));

        // Egresos totales
        $totalExpense = DB::table('expenses')
            ->where('branch_id', $branchId)
            ->when($from, fn($q) => $q->where('spent_at', '>=', $from))
            ->when($to, fn($q) => $q->where('spent_at', '<=', $to . ' 23:59:59'))
            ->sum('amount');

        // Neto
        $net = $totalIncome - $totalExpense;

        // Ingresos por día
        $incomeByDay = DB::table('payments')
            ->selectRaw('DATE(paid_at) as date, SUM(amount + tip_amount) as total')
            ->where('branch_id', $branchId)
            ->when($from, fn($q) => $q->where('paid_at', '>=', $from))
            ->when($to, fn($q) => $q->where('paid_at', '<=', $to . ' 23:59:59'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Egresos por día
        $expenseByDay = DB::table('expenses')
            ->selectRaw('DATE(spent_at) as date, SUM(amount) as total')
            ->where('branch_id', $branchId)
            ->when($from, fn($q) => $q->where('spent_at', '>=', $from))
            ->when($to, fn($q) => $q->where('spent_at', '<=', $to . ' 23:59:59'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Ingresos por método de pago
        $incomeByMethod = DB::table('payments')
            ->join('payment_methods', 'payment_methods.id', '=', 'payments.payment_method_id')
            ->select('payment_methods.name as method', DB::raw('SUM(payments.amount + payments.tip_amount) as total'))
            ->where('payments.branch_id', $branchId)
            ->when($from, fn($q) => $q->where('payments.paid_at', '>=', $from))
            ->when($to, fn($q) => $q->where('payments.paid_at', '<=', $to . ' 23:59:59'))
            ->groupBy('payment_methods.id', 'payment_methods.name')
            ->orderByDesc('total')
            ->get();

        // Egresos por categoría
        $expenseByCategory = DB::table('expenses')
            ->join('expense_categories', 'expense_categories.id', '=', 'expenses.category_id')
            ->select('expense_categories.name as category', DB::raw('SUM(expenses.amount) as total'))
            ->where('expenses.branch_id', $branchId)
            ->when($from, fn($q) => $q->where('expenses.spent_at', '>=', $from))
            ->when($to, fn($q) => $q->where('expenses.spent_at', '<=', $to . ' 23:59:59'))
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->orderByDesc('total')
            ->get();

        // Últimas ventas
        $latestSales = DB::table('sales')
            ->leftJoin('customers', 'customers.id', '=', 'sales.customer_id')
            ->select('sales.id', 'sales.number', 'sales.sold_at', 'sales.total_amount',
                DB::raw('CONCAT(customers.first_name, " ", customers.last_name) as customer_name'))
            ->where('sales.branch_id', $branchId)
            ->where('sales.status', 'CONFIRMED')
            ->when($from, fn($q) => $q->where('sales.sold_at', '>=', $from))
            ->when($to, fn($q) => $q->where('sales.sold_at', '<=', $to . ' 23:59:59'))
            ->orderByDesc('sales.sold_at')
            ->limit(10)
            ->get();

        // Servicios más vendidos
        $topServices = DB::table('sale_services as ss')
            ->join('sales as s', 's.id', '=', 'ss.sale_id')
            ->join('services as svc', 'svc.id', '=', 'ss.service_id')
            ->where('s.branch_id', $branchId)
            ->where('s.status', 'CONFIRMED')
            ->when($from, fn($q) => $q->where('s.sold_at', '>=', $from))
            ->when($to, fn($q) => $q->where('s.sold_at', '<=', $to . ' 23:59:59'))
            ->select('svc.name as service_name', DB::raw('SUM(ss.quantity) as quantity'), DB::raw('SUM(ss.net_amount) as total'))
            ->groupBy('svc.id', 'svc.name')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get();

        // Barberos top
        $topBarbers = DB::table('sale_services as ss')
            ->join('sales as s', 's.id', '=', 'ss.sale_id')
            ->join('employees as e', 'e.id', '=', 'ss.barber_id')
            ->where('s.branch_id', $branchId)
            ->where('s.status', 'CONFIRMED')
            ->when($from, fn($q) => $q->where('s.sold_at', '>=', $from))
            ->when($to, fn($q) => $q->where('s.sold_at', '<=', $to . ' 23:59:59'))
            ->select('e.id as barber_id', DB::raw('CONCAT(e.first_name, " ", e.last_name) as barber_name'), DB::raw('SUM(ss.quantity) as services_count'), DB::raw('SUM(ss.net_amount) as total'))
            ->groupBy('e.id', 'e.first_name', 'e.last_name')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // Últimos egresos
        $latestExpenses = DB::table('expenses')
            ->join('expense_categories', 'expense_categories.id', '=', 'expenses.category_id')
            ->select('expenses.id', 'expenses.spent_at', 'expenses.amount', 'expenses.description',
                'expense_categories.name as category_name')
            ->where('expenses.branch_id', $branchId)
            ->when($from, fn($q) => $q->where('expenses.spent_at', '>=', $from))
            ->when($to, fn($q) => $q->where('expenses.spent_at', '<=', $to . ' 23:59:59'))
            ->orderByDesc('expenses.spent_at')
            ->limit(10)
            ->get();

        return Api::ok([
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net' => $net,
            ],
            'income_by_day' => $incomeByDay,
            'expense_by_day' => $expenseByDay,
            'income_by_method' => $incomeByMethod,
            'expense_by_category' => $expenseByCategory,
            'latest_sales' => $latestSales,
            'latest_expenses' => $latestExpenses,
            'top_services' => $topServices,
            'top_barbers' => $topBarbers,
        ]);
    }
}

<?php
namespace App\Http\Controllers;
use App\Application\Inventory\AdjustStock;
use App\Support\Api;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class InventoryController extends Controller {
    public function index(Request $r) {$q=DB::table('inventory_movements')->where('branch_id',$this->branch($r));if($r->filled('product_id'))$q->where('product_id',(int)$r->query('product_id'));return Api::ok($q->orderByDesc('id')->paginate($this->perPage($r)));}
    public function store(Request $r,AdjustStock $action) {
        $d=$r->validate(['operation_key'=>'required|uuid','product_id'=>'required|integer','type'=>'required|in:OPENING,PURCHASE,CONSUMPTION,ADJUSTMENT_IN,ADJUSTMENT_OUT','quantity'=>'required|regex:/^\d{1,8}(\.\d{1,3})?$/','unit_cost'=>'required_if:type,OPENING,PURCHASE|regex:/^\d{1,7}(\.\d{1,4})?$/','reason'=>'required|string|max:255']);
        return Api::ok($action->execute($d,$this->branch($r),$this->user($r)),'Stock actualizado.',201);
    }
}

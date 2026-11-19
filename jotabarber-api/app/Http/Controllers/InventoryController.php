<?php
namespace App\Http\Controllers;
use App\Application\Inventory\AdjustStock;
use App\Support\Api;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class InventoryController extends Controller {
    public function index(Request $r) {
        $q=DB::table('inventory_movements as m')
            ->join('products as p','p.id','=','m.product_id')
            ->leftJoin('users as u','u.id','=','m.created_by')
            ->where('m.branch_id',$this->branch($r))
            ->select('m.*','p.name as product_name','p.sku as product_sku','u.name as user_name');
        if($r->filled('product_id'))$q->where('m.product_id',(int)$r->query('product_id'));
        if($r->filled('type'))$q->where('m.type',$r->query('type'));
        if($r->filled('from'))$q->where('m.occurred_at','>=',$r->query('from').' 00:00:00');
        if($r->filled('to'))$q->where('m.occurred_at','<=',$r->query('to').' 23:59:59');
        if($r->filled('q')){$term='%'.substr((string)$r->query('q'),0,100).'%';$q->where(function($w)use($term){$w->where('p.name','like',$term)->orWhere('p.sku','like',$term)->orWhere('m.reason','like',$term);});}
        return Api::ok($q->orderByDesc('m.id')->paginate($this->perPage($r)));
    }
    public function store(Request $r,AdjustStock $action) {
        $d=$r->validate(['operation_key'=>'required|uuid','product_id'=>'required|integer','type'=>'required|in:OPENING,PURCHASE,CONSUMPTION,ADJUSTMENT_IN,ADJUSTMENT_OUT','quantity'=>'required|regex:/^\d{1,8}(\.\d{1,3})?$/','unit_cost'=>'required_if:type,OPENING,PURCHASE|regex:/^\d{1,7}(\.\d{1,4})?$/','reason'=>'required|string|max:255']);
        return Api::ok($action->execute($d,$this->branch($r),$this->user($r)),'Stock actualizado.',201);
    }
}

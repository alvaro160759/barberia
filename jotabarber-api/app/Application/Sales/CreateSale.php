<?php
namespace App\Application\Sales;
use App\Support\{Audit,Idempotency,Money,Records};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class CreateSale {
    public function execute(array $d,int $branch,int $user): object {
        $hash=Idempotency::hash($d,$branch);
        return DB::transaction(function()use($d,$branch,$user,$hash){
            $old=DB::table('sales')->where('operation_key',$d['operation_key'])->first();
            if($old){Idempotency::match($old,$branch,$hash);return $old;}
            $services=$d['services']??[];$products=$d['products']??[];
            if(!$services&&!$products)Records::error('services','Agrega al menos un servicio o producto.');
            if(!empty($d['customer_id']))Records::active('customers',(int)$d['customer_id']);
            $barbers=array_unique(array_column($services,'barber_id'));sort($barbers);
            DB::table('employees')->whereIn('id',$barbers)->orderBy('id')->lockForUpdate()->get();
            foreach($barbers as $b)Records::barber((int)$b,$branch);
            $appointment=null;
            if(!empty($d['appointment_id'])){
                $appointment=DB::table('appointments')->where('id',$d['appointment_id'])->where('branch_id',$branch)->lockForUpdate()->first();
                if(!$appointment || !in_array($appointment->status,['CONFIRMED','IN_PROGRESS','COMPLETED']))Records::error('appointment_id','Cita no válida para facturar.');
                if(DB::table('sales')->where('appointment_id',$appointment->id)->exists())Records::error('appointment_id','La cita ya tiene una venta.');
                if(isset($d['customer_id'])&&(int)$d['customer_id']!==(int)$appointment->customer_id)Records::error('customer_id','El cliente debe coincidir con la cita.');
                foreach($barbers as $b)if((int)$b!==(int)$appointment->barber_id)Records::error('barber_id','El barbero debe coincidir con la cita.');
            }
            $serviceRows=[];$productRows=[];$subtotal=0;$discounts=0;
            foreach($services as $line){
                $s=DB::table('branch_services as bs')->join('services as s','s.id','=','bs.service_id')->where('bs.branch_id',$branch)->where('bs.service_id',$line['service_id'])->where('bs.active',true)->where('s.active',true)->select('bs.*','s.name')->first();
                if(!$s)Records::error('services','Servicio no disponible.');
                $rate=DB::table('barber_service_rates')->where('branch_id',$branch)->where('employee_id',$line['barber_id'])->where('service_id',$line['service_id'])->where('active',true)->first();
                $qty=(int)$line['quantity'];$price=Money::cents((string)$s->price);$discount=Money::cents((string)($line['discount_amount']??'0'));
                $net=$qty*$price-$discount;if($net<0)Records::error('discount_amount','El descuento supera el importe del servicio.');
                $barberPercent=(string)($rate?->barber_percentage??$s->barber_percentage);$ownerPercent=(string)($rate?->owner_percentage??$s->owner_percentage);
                $barberAmount=Money::share($net,$barberPercent);$subtotal+=$qty*$price;$discounts+=$discount;
                $serviceRows[]=['branch_id'=>$branch,'service_id'=>$s->service_id,'barber_id'=>$line['barber_id'],'service_name'=>$s->name,'quantity'=>$qty,'unit_price'=>Money::decimal($price),'discount_amount'=>Money::decimal($discount),'net_amount'=>Money::decimal($net),'barber_percentage'=>$barberPercent,'owner_percentage'=>$ownerPercent,'barber_amount'=>Money::decimal($barberAmount),'owner_amount'=>Money::decimal($net-$barberAmount)];
            }
            // Bloqueo de stock por orden de producto para ventas concurrentes.
            usort($products,fn($a,$b)=>$a['product_id']<=>$b['product_id']);
            foreach($products as $line){
                $p=DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$line['product_id'])->lockForUpdate()->first();
                $master=DB::table('products')->where('id',$line['product_id'])->where('active',true)->first();
                if(!$p||!$p->active||!$master||$master->usage_type==='INTERNAL')Records::error('products','Producto no disponible para venta.');
                $qty=(int)$line['quantity'];if(bccomp((string)$p->stock_qty,(string)$qty,3)<0)Records::error('products','Stock insuficiente para '.$master->name.'.');
                $price=Money::cents((string)$p->sale_price);$discount=Money::cents((string)($line['discount_amount']??'0'));$net=$qty*$price-$discount;
                if($net<0)Records::error('discount_amount','El descuento supera el importe del producto.');
                $subtotal+=$qty*$price;$discounts+=$discount;
                $productRows[]=['branch_id'=>$branch,'product_id'=>$p->product_id,'product_name'=>$master->name,'quantity'=>$qty,'unit_price'=>Money::decimal($price),'unit_cost'=>$p->average_cost,'discount_amount'=>Money::decimal($discount),'net_amount'=>Money::decimal($net)];
                DB::table('branch_products')->where('branch_id',$branch)->where('product_id',$p->product_id)->update(['stock_qty'=>bcsub((string)$p->stock_qty,(string)$qty,3),'updated_at'=>now()]);
            }
            $id=Records::insert('sales',['branch_id'=>$branch,'customer_id'=>$appointment?->customer_id??($d['customer_id']??null),'appointment_id'=>$appointment?->id,'number'=>'V-'.Str::upper(Str::random(16)),'operation_key'=>$d['operation_key'],'request_hash'=>$hash,'sold_at'=>now(),'status'=>'CONFIRMED','subtotal_amount'=>Money::decimal($subtotal),'discount_amount'=>Money::decimal($discounts),'total_amount'=>Money::decimal($subtotal-$discounts),'notes'=>$d['notes']??null,'created_by'=>$user]);
            foreach($serviceRows as $row)Records::insert('sale_services',$row+['sale_id'=>$id]);
            foreach($productRows as $row){$lineId=Records::insert('sale_products',$row+['sale_id'=>$id]);Records::insert('inventory_movements',['branch_id'=>$branch,'product_id'=>$row['product_id'],'sale_product_id'=>$lineId,'type'=>'SALE','quantity_delta'=>-$row['quantity'],'unit_cost'=>$row['unit_cost'],'occurred_at'=>now(),'created_by'=>$user,'operation_key'=>(string)Str::uuid(),'request_hash'=>null]);}
            if($appointment)DB::table('appointments')->where('id',$appointment->id)->update(['status'=>'COMPLETED','updated_at'=>now()]);
            Audit::log($branch,$user,'CREATE','sales',$id);return DB::table('sales')->where('id',$id)->first();
        },3);
    }
}

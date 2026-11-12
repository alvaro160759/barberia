<?php
namespace Tests\Feature;
use App\Application\Sales\CreateSale;
use App\Application\Appointments\SaveAppointment;
use App\Application\Commissions\PayCommission;
use App\Models\User;
use App\Support\Records;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;
final class OperationsTest extends TestCase {
    private int $branch; private int $other; private int $barber; private int $service; private int $customer; private User $user; private string $token;
    protected function setUp(): void {
        parent::setUp();
        if(!str_ends_with((string)config('database.connections.mysql.database'),'_testing')) throw new \RuntimeException('Usa una base dedicada con sufijo _testing.');
        DB::beginTransaction();
        $this->branch=Records::insert('branches',['code'=>'T-'.Str::random(8),'name'=>'Prueba']);
        $this->other=Records::insert('branches',['code'=>'T-'.Str::random(8),'name'=>'Otra']);
        $this->user=User::create(['name'=>'Admin test','username'=>'test-'.Str::uuid(),'password'=>'Password-test-123','active'=>true]);
        DB::table('user_branches')->insert(['user_id'=>$this->user->id,'branch_id'=>$this->branch,'active'=>true]);
        $role=DB::table('roles')->where('code','admin')->value('id');$this->assertNotNull($role,'Ejecuta migrate --seed --env=testing.');
        DB::table('branch_user_roles')->insert(['user_id'=>$this->user->id,'branch_id'=>$this->branch,'role_id'=>$role]);
        $token=$this->user->createToken('test');$this->token=$token->plainTextToken;
        DB::table('token_branches')->insert(['token_id'=>$token->accessToken->id,'branch_id'=>$this->branch]);
        $this->barber=Records::insert('employees',['first_name'=>'Pedro','last_name'=>'Test','job_type'=>'BARBER']);
        DB::table('employee_branches')->insert(['employee_id'=>$this->barber,'branch_id'=>$this->branch,'active'=>true]);
        $cat=Records::insert('service_categories',['name'=>'Test']);
        $this->service=Records::insert('services',['category_id'=>$cat,'code'=>'T-'.Str::random(8),'name'=>'Corte']);
        DB::table('branch_services')->insert(['branch_id'=>$this->branch,'service_id'=>$this->service,'price'=>'30.00','duration_minutes'=>30,'barber_percentage'=>'40.00','owner_percentage'=>'60.00']);
        $this->customer=Records::insert('customers',['first_name'=>'Cliente']);
    }
    protected function tearDown(): void {if(isset($this->branch))DB::rollBack();parent::tearDown();}
    private function saleData(): array {return ['operation_key'=>(string)Str::uuid(),'services'=>[['service_id'=>$this->service,'barber_id'=>$this->barber,'quantity'=>1,'discount_amount'=>'5.00']]];}
    public function test_sale_preserves_rate_and_retry_is_not_duplicated(): void {
        $d=$this->saleData();$a=app(CreateSale::class);$s=$a->execute($d,$this->branch,$this->user->id);
        DB::table('branch_services')->where('branch_id',$this->branch)->where('service_id',$this->service)->update(['barber_percentage'=>50,'owner_percentage'=>50]);
        $again=$a->execute($d,$this->branch,$this->user->id);$this->assertSame($s->id,$again->id);
        $line=DB::table('sale_services')->where('sale_id',$s->id)->first();
        $this->assertSame('10.00',$line->barber_amount);$this->assertSame('15.00',$line->owner_amount);
        $this->assertSame(1,DB::table('sales')->where('operation_key',$d['operation_key'])->count());
    }
    public function test_failed_product_rolls_back_stock_and_sale(): void {
        $cat=Records::insert('product_categories',['name'=>'Test']);$ids=[];
        foreach([2,0] as $stock){$id=Records::insert('products',['category_id'=>$cat,'sku'=>'T-'.Str::random(8),'name'=>'Cera','unit'=>'UND','usage_type'=>'SALE']);$ids[]=$id;DB::table('branch_products')->insert(['branch_id'=>$this->branch,'product_id'=>$id,'sale_price'=>10,'stock_qty'=>$stock]);}
        $d=['operation_key'=>(string)Str::uuid(),'products'=>array_map(fn($id)=>['product_id'=>$id,'quantity'=>1],$ids)];
        try{app(CreateSale::class)->execute($d,$this->branch,$this->user->id);$this->fail('Se esperaba stock insuficiente.');}catch(ValidationException $e){$this->assertNotEmpty($e->errors());}
        $this->assertEquals(2,DB::table('branch_products')->where('branch_id',$this->branch)->where('product_id',$ids[0])->value('stock_qty'));
        $this->assertFalse(DB::table('sales')->where('operation_key',$d['operation_key'])->exists());
    }
    public function test_session_rejects_unassigned_branch(): void {
        $this->withToken($this->token)->postJson('/api/auth/branch',['branch_id'=>$this->other])->assertForbidden();
    }
    public function test_client_cannot_override_sale_branch(): void {
        $this->withToken($this->token)->postJson('/api/sales',$this->saleData()+['branch_id'=>$this->other])->assertCreated()->assertJsonPath('data.branch_id',$this->branch);
    }
    public function test_barber_cannot_read_everyones_commissions(): void {
        DB::table('branch_user_roles')->where('user_id',$this->user->id)->update(['role_id'=>DB::table('roles')->where('code','barber')->value('id')]);
        DB::table('employees')->where('id',$this->barber)->update(['user_id'=>$this->user->id]);
        $this->withToken($this->token)->getJson('/api/commissions')->assertForbidden();
        $this->withToken($this->token)->getJson('/api/my-commissions/pending?barber_id=99999')->assertOk()->assertJsonCount(0,'data.data');
    }
    public function test_overlapping_appointment_is_rejected(): void {
        $start=now('America/Lima')->addDays(7)->setTime(10,0)->toImmutable();
        Records::insert('barber_schedules',['branch_id'=>$this->branch,'employee_id'=>$this->barber,'weekday'=>$start->dayOfWeekIso,'starts_at'=>'09:00:00','ends_at'=>'18:00:00']);
        $d=['customer_id'=>$this->customer,'barber_id'=>$this->barber,'starts_at'=>$start->toIso8601String(),'service_ids'=>[$this->service]];
        app(SaveAppointment::class)->execute($d,$this->branch,$this->user->id);
        $this->expectException(ValidationException::class);app(SaveAppointment::class)->execute($d,$this->branch,$this->user->id);
    }
    public function test_only_paid_services_can_be_settled_once(): void {
        $sale=app(CreateSale::class)->execute($this->saleData(),$this->branch,$this->user->id);
        $line=DB::table('sale_services')->where('sale_id',$sale->id)->value('id');$method=DB::table('payment_methods')->where('code','TRANSFER')->value('id');
        $d=['operation_key'=>(string)Str::uuid(),'barber_id'=>$this->barber,'period_start'=>now('America/Lima')->toDateString(),'period_end'=>now('America/Lima')->toDateString(),'sale_service_ids'=>[$line],'payment_method_id'=>$method];
        try{app(PayCommission::class)->execute($d,$this->branch,$this->user->id);$this->fail('Se esperaba venta no cobrada.');}catch(ValidationException $e){$this->assertNotEmpty($e->errors());}
        Records::insert('payments',['sale_id'=>$sale->id,'branch_id'=>$this->branch,'payment_method_id'=>$method,'amount'=>'25.00','paid_at'=>now(),'created_by'=>$this->user->id,'operation_key'=>(string)Str::uuid()]);
        $settled=app(PayCommission::class)->execute($d,$this->branch,$this->user->id);$this->assertSame('10.00',$settled->amount);
        $d['operation_key']=(string)Str::uuid();$this->expectException(ValidationException::class);app(PayCommission::class)->execute($d,$this->branch,$this->user->id);
    }
}

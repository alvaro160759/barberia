<?php
namespace App\Http\Controllers;
use App\Support\{Api,Audit,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class EmployeeController extends Controller {
    private function query(Request $r) {return DB::table('employees as e')->join('employee_branches as eb','eb.employee_id','=','e.id')->where('eb.branch_id',$this->branch($r))->select('e.*','eb.active as branch_active');}
    public function index(Request $r) {
        $q=$this->query($r);if($r->filled('job_type'))$q->where('e.job_type',$r->query('job_type'));
        if($r->filled('q'))$q->where(function($q)use($r){$q->where('e.first_name','like','%'.substr($r->query('q'),0,100).'%')->orWhere('e.last_name','like','%'.substr($r->query('q'),0,100).'%');});
        return Api::ok($q->orderBy('e.first_name')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {$row=$this->query($r)->where('e.id',$r->route('id'))->first();abort_unless($row,404);return Api::ok($row);}
    public function store(Request $r) {return $this->save($r,false);}
    public function update(Request $r) {return $this->save($r,true);}
    private function save(Request $r,bool $update) {
        $d=$r->validate(['first_name'=>'required|string|max:100','last_name'=>'required|string|max:100','job_type'=>'required|in:BARBER,RECEPTIONIST,MANAGER,OTHER','document_type'=>'nullable|string|max:20','document_number'=>'nullable|string|max:30','phone'=>'nullable|string|max:30','email'=>'nullable|email|max:150','hire_date'=>'nullable|date','active'=>'sometimes|boolean','user_id'=>'nullable|integer']);
        
        // Validar que el número de documento no esté duplicado
        if(!empty($d['document_number'])){
            $query=DB::table('employees')->where('document_number',$d['document_number']);
            if($update){
                $query->where('id','!=',(int)$r->route('id'));
            }
            if($query->exists()){
                Records::error('document_number','Número de documento ya está asignado a un empleado.');
            }
        }
        
        if(!empty($d['user_id'])&&!DB::table('user_branches')->where('user_id',$d['user_id'])->where('branch_id',$this->branch($r))->where('active',true)->exists())Records::error('user_id','Usuario no asociado a esta sucursal.');
        return DB::transaction(function()use($r,$d,$update){
            if($update){$id=(int)$r->route('id');abort_unless($this->query($r)->where('e.id',$id)->first(),404);DB::table('employees')->where('id',$id)->lockForUpdate()->first();DB::table('employees')->where('id',$id)->update($d+['updated_at'=>now()]);}
            else {$id=Records::insert('employees',$d);DB::table('employee_branches')->insert(['employee_id'=>$id,'branch_id'=>$this->branch($r),'active'=>true,'created_at'=>now(),'updated_at'=>now()]);}
            Audit::log($this->branch($r),$this->user($r),$update?'UPDATE':'CREATE','employees',$id);return Api::ok(DB::table('employees')->where('id',$id)->first(),'Personal guardado.',$update?200:201);
        });
    }
    public function assign(Request $r) {
        $d=$r->validate(['employee_id'=>'required|integer|exists:employees,id','active'=>'required|boolean']);
        DB::table('employee_branches')->upsert([['employee_id'=>$d['employee_id'],'branch_id'=>$this->branch($r),'active'=>$d['active'],'created_at'=>now(),'updated_at'=>now()]],['employee_id','branch_id'],['active','updated_at']);return Api::ok();
    }
    public function directory(Request $r) {return Api::ok(DB::table('employees')->select('id','first_name','last_name','job_type','active')->orderBy('first_name')->paginate($this->perPage($r)));}
    public function destroy(Request $r) {
        $id=(int)$r->route('id');abort_unless($this->query($r)->where('e.id',$id)->first(),404);
        DB::table('employee_branches')->where('branch_id',$this->branch($r))->where('employee_id',$id)->update(['active'=>false,'updated_at'=>now()]);return Api::ok(null,'Empleado desactivado en esta sucursal.');
    }
}

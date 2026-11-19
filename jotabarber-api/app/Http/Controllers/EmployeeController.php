<?php
namespace App\Http\Controllers;
use App\Support\{Access,Api,Audit,Records};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class EmployeeController extends Controller {
    private function query(Request $r) {return DB::table('employees as e')->join('employee_branches as eb','eb.employee_id','=','e.id')->where('eb.branch_id',$this->branch($r))->leftJoin('employee_branches as eba',function($j){$j->on('eba.employee_id','=','e.id')->where('eba.active',true);})->leftJoin('branches as bb','bb.id','=','eba.branch_id')->select('e.*','eb.active as branch_active','eba.branch_id as assigned_branch_id','bb.name as branch_name');}
    public function index(Request $r) {
        if($r->boolean('all')) {
            $q=DB::table('employees as e')
                ->leftJoin('employee_branches as eba',function($j){$j->on('eba.employee_id','=','e.id')->where('eba.active',true);})->leftJoin('branches as bb','bb.id','=','eba.branch_id')
                ->select('e.*','eba.branch_id as assigned_branch_id','bb.name as branch_name');
        } else {$q=$this->query($r);}
        if($r->filled('job_type'))$q->where('e.job_type',$r->query('job_type'));
        if($r->filled('q'))$q->where(function($q)use($r){$q->where('e.first_name','like','%'.substr($r->query('q'),0,100).'%')->orWhere('e.last_name','like','%'.substr($r->query('q'),0,100).'%');});
        return Api::ok($q->orderBy('e.first_name')->paginate($this->perPage($r)));
    }
    public function show(Request $r) {$row=DB::table('employees as e')->leftJoin('employee_branches as eba',function($j){$j->on('eba.employee_id','=','e.id')->where('eba.active',true);})->leftJoin('branches as bb','bb.id','=','eba.branch_id')->where('e.id',$r->route('id'))->select('e.*','eba.branch_id as assigned_branch_id','bb.name as branch_name')->first();abort_unless($row,404);return Api::ok($row);}
    public function store(Request $r) {return $this->save($r,false);}
    public function update(Request $r) {return $this->save($r,true);}
    private function save(Request $r,bool $update) {
        $d=$r->validate(['first_name'=>'required|string|max:100','last_name'=>'required|string|max:100','job_type'=>'required|in:BARBER,RECEPTIONIST,MANAGER,OTHER','document_type'=>'nullable|string|max:20','document_number'=>'nullable|string|max:30','phone'=>'nullable|string|max:30','email'=>'nullable|email|max:150','hire_date'=>'nullable|date','active'=>'sometimes|boolean','avatar'=>'nullable|image|max:2048','user_id'=>'nullable|integer','branch_id'=>'nullable|integer|min:1']);
        if($r->hasFile('avatar')){
            $dir=public_path('uploads/employees');if(!is_dir($dir))mkdir($dir,0755,true);
            $file=$r->file('avatar');$name='emp_'.($update?(int)$r->route('id'):'new').'_'.time().'.'.$file->getClientOriginalExtension();
            $file->move($dir,$name);$d['avatar']='/uploads/employees/'.$name;
        }
        $assignedBranch=$d['branch_id']??null;unset($d['branch_id']);
        if($assignedBranch!==null)abort_unless(Access::allowedBranch($this->user($r),(int)$assignedBranch),403,'Sucursal no autorizada.');
        
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
        return DB::transaction(function()use($r,$d,$update,$assignedBranch){
            if($update){$id=(int)$r->route('id');abort_unless(DB::table('employees')->where('id',$id)->exists(),404);DB::table('employees')->where('id',$id)->lockForUpdate()->first();DB::table('employees')->where('id',$id)->update($d+['updated_at'=>now()]);
                if($assignedBranch!==null){DB::table('employee_branches')->where('employee_id',$id)->update(['active'=>false,'updated_at'=>now()]);DB::table('employee_branches')->upsert([['employee_id'=>$id,'branch_id'=>(int)$assignedBranch,'active'=>true,'created_at'=>now(),'updated_at'=>now()]],['employee_id','branch_id'],['active','updated_at']);}
            }
            else {$id=Records::insert('employees',$d);$createBranch=$assignedBranch??$this->branch($r);DB::table('employee_branches')->insert(['employee_id'=>$id,'branch_id'=>$createBranch,'active'=>true,'created_at'=>now(),'updated_at'=>now()]);}
            Audit::log($this->branch($r),$this->user($r),$update?'UPDATE':'CREATE','employees',$id);return Api::ok(DB::table('employees')->where('id',$id)->first(),'Personal guardado.',$update?200:201);
        });
    }
    public function assign(Request $r) {
        $d=$r->validate(['employee_id'=>'required|integer|exists:employees,id','active'=>'required|boolean','branch_id'=>'nullable|integer|min:1']);
        $branch=(int)($d['branch_id']??$this->branch($r));
        abort_unless(Access::allowedBranch($this->user($r),$branch),403,'Sucursal no autorizada.');
        DB::table('employee_branches')->upsert([['employee_id'=>$d['employee_id'],'branch_id'=>$branch,'active'=>$d['active'],'created_at'=>now(),'updated_at'=>now()]],['employee_id','branch_id'],['active','updated_at']);return Api::ok();
    }
    public function directory(Request $r) {return Api::ok(DB::table('employees')->select('id','first_name','last_name','job_type','active')->orderBy('first_name')->paginate($this->perPage($r)));}
    public function destroy(Request $r) {
        $id=(int)$r->route('id');abort_unless($this->query($r)->where('e.id',$id)->first(),404);
        DB::table('employee_branches')->where('branch_id',$this->branch($r))->where('employee_id',$id)->update(['active'=>false,'updated_at'=>now()]);return Api::ok(null,'Empleado desactivado en esta sucursal.');
    }
}

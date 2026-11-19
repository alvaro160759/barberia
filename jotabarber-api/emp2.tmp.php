<?php
$p='app/Http/Controllers/EmployeeController.php';
$s=file_get_contents($p);
$old="        if(\$r->hasFile('avatar'))\$d['avatar']=\$r->file('avatar')->store('employees','public');";
$new=<<<'NEW'
        if($r->hasFile('avatar')){
            $dir=public_path('uploads/employees');if(!is_dir($dir))mkdir($dir,0755,true);
            $file=$r->file('avatar');$name='emp_'.(\$update?(int)$r->route('id'):'new').'_'.time().'.'.$file->getClientOriginalExtension();
            $file->move($dir,$name);$d['avatar']='/uploads/employees/'.$name;
        }
NEW;
$s=str_replace($old,$new,$s);
file_put_contents($p,$s);
echo 'done';

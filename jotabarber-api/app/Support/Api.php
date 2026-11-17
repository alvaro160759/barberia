<?php
namespace App\Support;
use Illuminate\Http\JsonResponse;
class Api {
    public static function ok(mixed $data=null,string $message='Operación realizada.',int $status=200): JsonResponse {
        return response()->json(['success'=>true,'message'=>$message,'data'=>$data],$status);
    }
    public static function error(string $message='Error.',int $status=400,mixed $data=null,array $errors=null): JsonResponse {
        $payload=['success'=>false,'message'=>$message];
        if($data!==null)$payload['data']=$data;
        if($errors!==null)$payload['errors']=$errors;
        return response()->json($payload,$status);
    }
}

<?php
namespace App\Support;
use Illuminate\Http\JsonResponse;
class Api {
    public static function ok(mixed $data=null,string $message='Operación realizada.',int $status=200): JsonResponse {
        return response()->json(['success'=>true,'message'=>$message,'data'=>$data],$status);
    }
}

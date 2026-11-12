<?php
namespace App\Support;
class Idempotency {
    public static function hash(array $data,int $branch): string {
        $sort=function(array $data)use(&$sort):array {if(!array_is_list($data))ksort($data);foreach($data as &$value){if(is_array($value))$value=$sort($value);}return $data;};
        return hash('sha256',json_encode([$branch,$sort($data)],JSON_THROW_ON_ERROR));
    }
    public static function match(object $record,int $branch,string $hash): void {
        abort_if((int)$record->branch_id!==$branch || $record->request_hash!==$hash,409,'operation_key ya fue utilizada con otra solicitud.');
    }
}

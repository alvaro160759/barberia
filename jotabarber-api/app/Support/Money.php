<?php
namespace App\Support;
use InvalidArgumentException;
class Money {
    public static function cents(string|int $value): int {
        $s=(string)$value;
        if(!preg_match('/^\d{1,10}(\.\d{1,2})?$/D',$s)) throw new InvalidArgumentException('Importe monetario inválido.');
        [$whole,$fraction]=array_pad(explode('.',$s,2),2,'');
        return ((int)$whole)*100+(int)str_pad($fraction,2,'0');
    }
    public static function decimal(int $cents): string {
        $sign=$cents<0?'-':'';$cents=abs($cents);
        return $sign.intdiv($cents,100).'.'.str_pad((string)($cents%100),2,'0',STR_PAD_LEFT);
    }
    public static function share(int $net,string $percent): int {
        $basisPoints=self::cents($percent);
        if($basisPoints>10000) throw new InvalidArgumentException('Porcentaje inválido.');
        return intdiv($net*$basisPoints+5000,10000);
    }
}

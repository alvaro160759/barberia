<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
abstract class Controller {
    protected function branch(Request $r): int {return $r->attributes->get('branch_id');}
    protected function user(Request $r): int {return $r->user()->id;}
    protected function perPage(Request $r): int {return min(100,max(1,(int)$r->query('per_page',20)));}
}

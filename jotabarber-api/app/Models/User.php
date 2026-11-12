<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable {
    use HasApiTokens;
    protected $fillable=['name','username','email','password','active'];
    protected $hidden=['password','remember_token'];
    protected function casts(): array { return ['active'=>'boolean','password'=>'hashed','email_verified_at'=>'datetime']; }
}

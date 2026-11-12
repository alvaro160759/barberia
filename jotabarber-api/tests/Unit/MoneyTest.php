<?php
namespace Tests\Unit;
use App\Support\Money;
use PHPUnit\Framework\TestCase;
final class MoneyTest extends TestCase {
    public function test_discounted_commission_conserves_every_cent(): void {
        $net=Money::cents('25.01');$barber=Money::share($net,'45.00');
        $this->assertSame('11.25',Money::decimal($barber));
        $this->assertSame('13.76',Money::decimal($net-$barber));
    }
    public function test_half_cent_rounds_up(): void {$this->assertSame(1,Money::share(1,'50'));}
    public function test_ambiguous_amount_is_rejected(): void {$this->expectException(\InvalidArgumentException::class);Money::cents('1,000.00');}
}

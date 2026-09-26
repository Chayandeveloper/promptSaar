<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $val = $setting->value;
        if (in_array(strtolower($val), ['true', '1'], true)) return true;
        if (in_array(strtolower($val), ['false', '0'], true)) return false;
        if (is_numeric($val)) return (int) $val;

        return $val;
    }

    public static function set(string $key, mixed $value): void
    {
        if (is_bool($value)) {
            $value = $value ? '1' : '0';
        }

        static::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value]
        );
    }

    public static function getAllSettings(): array
    {
        return [
            'enabled'              => (bool) static::get('rewards_enabled', true),
            'coins_per_ad'         => (int) static::get('coins_per_ad', 10),
            'daily_ad_limit'       => (int) static::get('daily_ad_limit', 5),
            'default_prompt_cost'  => (int) static::get('default_prompt_cost', 30),
        ];
    }
}

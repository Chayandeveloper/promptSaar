<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
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
            'min_version'          => (string) static::get('min_version', '1.0.0'),
            'latest_version'       => (string) static::get('latest_version', '1.0.0'),
            'force_update'         => (bool) static::get('force_update', false),
            'update_url'           => (string) static::get('update_url', 'https://play.google.com/store/apps/details?id=com.fillosoftpromptsaar.app'),
            'update_title'         => (string) static::get('update_title', 'New Update Available'),
            'update_message'       => (string) static::get('update_message', 'A new and improved version of Prompt Saar is available with new prompts, banners, and bug fixes. Please update to enjoy the best experience.'),
            'maintenance_mode'     => (bool) static::get('maintenance_mode', false),
            'maintenance_message'  => (string) static::get('maintenance_message', 'Prompt Saar is currently undergoing scheduled maintenance. Please check back shortly.'),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushNotification extends Model
{
    protected $table = 'push_notifications';

    protected $fillable = [
        'title',
        'body',
        'image_url',
        'action_type',
        'target_id',
        'data',
        'sent_count',
        'success_count',
        'failure_count',
        'status',
        'scheduled_at',
        'sent_at',
    ];

    protected $casts = [
        'data'          => 'array',
        'sent_count'    => 'integer',
        'success_count' => 'integer',
        'failure_count' => 'integer',
        'scheduled_at'  => 'datetime',
        'sent_at'       => 'datetime',
    ];
}

<?php

namespace App\Models;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chat extends Model
{
    use HasFactory;
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'session_id',
        'user_id',
        'name',
        'user_email'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all conversations for this chat session
     */
    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'session_id', 'session_id');
    }
}

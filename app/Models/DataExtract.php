<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataExtract extends Model
{
    use HasFactory;
    protected $table = 'data_extract';
    public $timestamps = false;
}

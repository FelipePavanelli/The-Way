<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DataExtractController;
use App\Http\Controllers\Api\ClientReportController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/data-extract/{session_id}', [DataExtractController::class, 'show']);
Route::get('/client-reports/{session_id}', [ClientReportController::class, 'show']);


Route::post('/auth/login', [AuthController::class, 'login']);
// Route::post('/register', [ClientController::class, 'register']);


Route::post('/gerar-relatorio-cliente', [ClientController::class, 'clientGenerateReport'])->name('client.generate.report');

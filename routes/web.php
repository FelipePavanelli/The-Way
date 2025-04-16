<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::middleware('auth')->group(function () {
    Route::get('/', [ChatController::class, 'index'])->name('chat');
    Route::post('/chat/process-message', [ChatController::class, 'processMessage'])->name('process.message');
    Route::put('/chats/{chat}', [ChatController::class, 'update'])->name('chats.update');
    Route::delete('/chats/{chat}', [ChatController::class, 'destroy'])->name('chats.destroy');

    Route::get('/relatorio', [ReportController::class, 'index'])->name('reports');
});

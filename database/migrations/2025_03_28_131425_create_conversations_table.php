<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id');
            $table->enum('role', ['user', 'assistant']);
            $table->text('content')->nullable();
            $table->timestamps();

            $table->foreign('session_id')
                  ->references('session_id')
                  ->on('chats')
                  ->onDelete('cascade');

            // Índices para melhor performance
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};

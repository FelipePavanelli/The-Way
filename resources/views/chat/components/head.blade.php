<!DOCTYPE html>
<html lang="pt-BR" class="{{ session('dark_mode') ? 'dark-mode' : 'light-mode' }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="The Way - Assistente de Planejamento Financeiro">
    <title>The Way Chat - Alta Vista</title>

    <!-- Pré-conexão para melhor performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Fontes com fallback -->
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Favicon -->
    <link rel="icon" href="{{ asset('images/favicon.ico') }}" type="image/x-icon">

    <!-- crf -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="session-id" content="{{ $sessionId }}">

    @vite([
    'resources/scss/app.scss',
    'resources/js/app.js',
    ])
</head>
</rewritten_file> 
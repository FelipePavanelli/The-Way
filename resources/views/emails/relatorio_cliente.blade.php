<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Way - Planejamento Financeiro</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #eaecf0;
            margin: 0;
            padding: 0;
        }

        .logo-area {
            text-align: center;
            margin-top: 36px;
            margin-bottom: 0;
        }

        .logo-area img {
            max-width: 300px;
            margin-bottom: 0;
            display: inline-block;
        }

        .container {
            background: #fff;
            max-width: 520px;
            margin: 32px auto 0 auto;
            border-radius: 18px;
            box-shadow: 0 4px 24px rgba(30, 42, 90, 0.10);
            padding: 38px 32px 28px 32px;
        }

        .header {
            text-align: center;
            margin-bottom: 18px;
        }

        .header h1 {
            color: #001847;
            font-size: 2.1rem;
            margin: 0 0 8px 0;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .content {
            color: #333;
            font-size: 1.08rem;
            margin-bottom: 24px;
            text-align: center;
        }

        .info {
            background: #dee5ee;
            border-left: 5px solid #001847;
            padding: 22px 24px 18px 24px;
            border-radius: 12px;
            margin-bottom: 28px;
            box-shadow: 0 2px 8px rgba(30, 42, 90, 0.04);
        }

        .info strong {
            color: #001847;
        }

        .info p {
            margin: 10px 0 10px 0;
            font-size: 1rem;
        }

        .button {
            display: inline-block;
            background: linear-gradient(90deg, #001847 60%, #3949ab 100%);
            color: #fff !important;
            padding: 15px 38px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.13rem;
            margin: 18px 0 0 0;
            box-shadow: 0 2px 8px rgba(30, 42, 90, 0.08);
            transition: background 0.2s;
        }

        .button:hover {
            background: linear-gradient(90deg, #3949ab 60%, #001847 100%);
        }

        .footer {
            text-align: center;
            color: #4d5d80;
            font-size: 0.98rem;
            margin-top: 36px;
            letter-spacing: 0.2px;
        }

        @media (max-width: 600px) {
            .container {
                padding: 18px 4vw 18px 4vw;
            }

            .logo-area img {
                max-width: 180px;
            }
        }
    </style>
</head>

<body>
    <div class="logo-area">
        <img src="{{ asset('images/logo-alta-vista-xp.png') }}" alt="Alta Vista">
    </div>
    <div class="container">
        <div class="header">
            <h1>The Way <br> Planejamento Financeiro</h1>
        </div>
        <div class="content">
            <p>Use as informações abaixo para acessar seu planejamento financeiro:</p>
        </div>
        <div class="info">
            <p><strong>Link:</strong> <a href="{{ $link }}" style="color:#001847; word-break:break-all;">{{ $link }}</a>
            </p>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Senha:</strong> {{ $password }}</p>
            <p style="text-align:center; margin-top: 22px;">
                <a href="{{ $link }}" class="button" target="_blank">Acessar Planejamento Financeiro</a>
            </p>
        </div>
        <div class="footer">
            <p>relatorio.theway.altavistainvest.com.br</p>
        </div>
    </div>
</body>

</html>

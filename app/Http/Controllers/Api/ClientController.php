<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use App\Http\Controllers\Controller;
// use App\Http\Requests\CreateClientRequest;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function clientGenerateReport(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'session_id' => 'required|string',
        ]);

        $password = bin2hex(random_bytes(8));

        // Remove a sessão de outro cliente que esteja usando a mesma session_id
        Client::where('session_id', $request->session_id)
            ->where('email', '!=', $request->email)
            ->delete();

        // Busca o cliente pelo e-mail
        $client = Client::where('email', $request->email)->first();

        if ($client) {
            // Atualiza a sessão e senha do cliente existente
            $client->update([
                'session_id' => $request->session_id,
                'password' => bcrypt($password),
            ]);
        } else {
            // Cria um novo cliente
            $client = Client::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($password),
                'session_id' => $request->session_id,
            ]);
        }

        return response()->json([
            'session_id' => $client->session_id,
            'email' => $client->email,
            'password' => $password,
        ]);
    }
}

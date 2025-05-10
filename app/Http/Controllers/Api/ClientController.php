<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateClientRequest;

class ClientController extends Controller
{
    public function register(CreateClientRequest $request)
    {

        $client = Client::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);


        return response()->json(['message' => 'Usuário criado com sucesso.', 'client' => $client], 201);
    }
}

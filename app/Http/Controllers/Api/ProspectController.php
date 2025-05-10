<?php

namespace App\Http\Controllers\Api;

use App\Models\Prospect;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateProspectRequest;

class ProspectController extends Controller
{
    public function register(CreateProspectRequest $request)
    {

        $prospect = Prospect::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);


        return response()->json(['message' => 'Usuário criado com sucesso.', 'prospect' => $prospect], 201);
    }
}

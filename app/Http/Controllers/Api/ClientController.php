<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use Illuminate\Http\Request;
// use App\Http\Requests\CreateClientRequest;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

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

    public function updateHiddenCards(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            // 'hiddenCards' => 'required|array',
        ]);

        $client = Client::where('session_id', $request->session_id)->first();

        if (!$client) {
            return response()->json(['message' => 'Cliente não encontrado'], 404);
        }

        $client->hidden_cards = json_encode($request->hiddenCards);
        $client->save();

        return response()->json(['message' => 'Cartões ocultos atualizados com sucesso']);
    }

    public function getHiddenCards(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);
        $client = Client::where('session_id', $request->session_id)->first();

        if (!$client) {
            return response()->json(['message' => 'Cliente não encontrado'], 404);
        }

        return response()->json([
            'hiddenCards' => json_decode($client->hidden_cards, true)
        ]);
    }

    public function storeOrUpdateEventsLiquidez(Request $request)
    {
        $data = $request->only(['session_id', 'evento', 'idade', 'tipo', 'valor']);

        $request->validate([
            'session_id' => 'nullable|string',
            'evento'     => 'nullable|string',
            'idade'      => 'nullable|integer',
            'tipo'       => 'nullable|string',
            'valor'      => 'nullable|numeric',
        ]);

        // Se session_id estiver vazio ou nulo, sempre insere um novo
        if (empty($data['session_id'])) {
            DB::table('eventos_liquidez')->insert($data);
        } else {
            // Verifica se já existe com session_id
            $exists = DB::table('eventos_liquidez')
                ->where('session_id', $data['session_id'])
                ->exists();

            if ($exists) {
                DB::table('eventos_liquidez')
                    ->where('session_id', $data['session_id'])
                    ->update($data);
            } else {
                DB::table('eventos_liquidez')->insert($data);
            }
        }

        return response()->json([
            'message' => 'Evento salvo com sucesso.',
        ]);
    }
}

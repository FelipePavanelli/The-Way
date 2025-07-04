<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use Illuminate\Http\Request;
// use App\Http\Requests\CreateClientRequest;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

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

    public function listEventsLiquidity(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $sessionId = $request->query('session_id');

        $eventsLiquidity = DB::table('eventos_liquidez')
            ->where('session_id', $sessionId)
            ->get();

        return response()->json([
            'eventsLiquidity' => $eventsLiquidity
        ]);
    }

    public function storeOrUpdateEventsLiquidity(Request $request)
    {
        $payload = $request->all();

        // Transforma em array se for um único objeto
        $eventos = is_array($payload) && isset($payload[0]) ? $payload : [$payload];

        // Verifica se o array está vazio ou contém dados vazios
        if (empty($eventos) || (count($eventos) === 1 && empty(array_filter($eventos[0])))) {
            // Caso esteja vazio, tenta pegar o session_id do request
            $sessionId = $request->input('session_id');

            if ($sessionId) {
                DB::table('eventos_liquidez')->where('session_id', $sessionId)->delete();

                return response()->json([
                    'message' => 'Eventos apagados com sucesso (nenhum novo fornecido).'
                ]);
            }

            return response()->json([
                'message' => 'Nenhum evento enviado e session_id ausente.'
            ], 400);
        }

        // Validação apenas dos campos existentes
        foreach ($eventos as $evento) {
            $validator = Validator::make($evento, [
                'session_id' => 'nullable|string',
                'nome'       => 'nullable|string',
                'idade'      => 'nullable|integer',
                'tipo'       => 'nullable|string',
                'valor'      => 'nullable|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação.',
                    'errors' => $validator->errors(),
                    'evento' => $evento
                ], 422);
            }
        }

        // Pega o session_id (assumindo que todos são iguais)
        $sessionId = $eventos[0]['session_id'] ?? null;

        if (!$sessionId) {
            return response()->json([
                'message' => 'session_id obrigatório para salvar ou apagar eventos.'
            ], 400);
        }

        // Apaga todos os eventos antigos desse session_id
        DB::table('eventos_liquidez')->where('session_id', $sessionId)->delete();

        // Insere os novos eventos
        DB::table('eventos_liquidez')->insert($eventos);

        return response()->json([
            'message' => 'Eventos substituídos com sucesso.'
        ]);
    }
}

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

        // Pega o session_id do primeiro item (ou do request diretamente, como fallback)
        $sessionId = $eventos[0]['session_id'] ?? $request->input('session_id');

        if (!$sessionId) {
            return response()->json([
                'message' => 'session_id é obrigatório.'
            ], 400);
        }

        // Se apenas session_id foi enviado (nenhum outro campo)
        $apenasSessionId = count($eventos) === 1 && count(array_keys($eventos[0])) === 1 && isset($eventos[0]['session_id']);

        if ($apenasSessionId) {
            DB::table('eventos_liquidez')->where('session_id', $sessionId)->delete();

            return response()->json([
                'message' => 'Todos os eventos apagados com sucesso para esse session_id.'
            ]);
        }

        // Validação dos eventos (campos não obrigatórios)
        foreach ($eventos as $evento) {
            $validator = Validator::make($evento, [
                'session_id' => 'required|string',
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

        // Apaga eventos antigos
        DB::table('eventos_liquidez')->where('session_id', $sessionId)->delete();

        // Insere novos
        DB::table('eventos_liquidez')->insert($eventos);

        return response()->json([
            'message' => 'Eventos substituídos com sucesso.'
        ]);
    }
}

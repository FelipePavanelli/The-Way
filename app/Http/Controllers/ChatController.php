<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Support\Str;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        // Toggle dark mode if requested
        if ($request->has('toggle_dark_mode')) {
            $darkMode = !session('dark_mode', false);
            session(['dark_mode' => $darkMode]);
            return back()->cookie('dark_mode', $darkMode, 30 * 24 * 60);
        }

        $chats = Chat::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')->get();


        // Se existir session_id na URL
        if ($request->has('sessionId')) {
            $sessionId = $request->query('sessionId');
            $conversations = Conversation::where('session_id', $sessionId)
                ->select('role', 'content', 'created_at')
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            $sessionId = Str::uuid();
            $conversations = null;
        }

        // dd( $conversations);
        return view('chat.app', [
            'sessionId' => $sessionId,
            'chats' => $chats ? $chats : null,
            'conversations' => $conversations
        ]);
    }

    public function processMessage(Request $request)
    {
        $validated = $request->validate([
            'userMessage' => 'required|string',
            'sessionId' => 'required|string',
        ]);

        DB::beginTransaction();
        try {

            $chat = Chat::find($validated['sessionId']);
            if (!$chat) {

                $chatCount = Chat::where('user_id', auth()->id())->count();
                $chat = Chat::create([
                    'session_id' => $validated['sessionId'],
                    'user_id' => auth()->id(),
                    'name' => 'Chat ' . ($chatCount + 1),
                    'user_email' => auth()->user()->email,
                ]);
            }

            Conversation::create([
                'session_id' => $chat->session_id,
                'role' => 'user',
                'content' => $validated['userMessage'],
            ]);

            $webhookUrl = env('WEB_HOOK_AGENT');

            $webhookData = [
                'userMessage' => $validated['userMessage'],
                'sessionId' => $chat->session_id,
                'userName' => auth()->user()->name,
                'userId' => auth()->id(),
                'userEmail' => auth()->user()->email
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($webhookUrl, $webhookData);

            if ($response->successful()) {
                $responseData = $response->json();

                Conversation::create([
                    'session_id' => $chat->session_id,
                    'role' => 'assistant',
                    'content' => $responseData['reply'],
                ]);

                DB::commit();
                return  Str::markdown($responseData['reply']);
            }

            return response()->json('Erro no processamento da mensagem', 500);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erro interno ao processar a mensagem',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Chat $chat)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $chat->update($validated);

        return response()->json(['success' => true]);
    }

    public function destroy(Chat $chat)
    {
        $chat->delete();

        return response()->json(['success' => true]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;


class ReportController extends Controller
{
    public function generateReport(Request $request)
    {
        $sessionId = $request->input('sessionId');

        $webhookUrl = env('WEB_HOOK_AGENT');

        $webhookData = [
            'userMessage' => 'Me apresente o planejamento, na versão final para cliente.',
            'sessionId' => $sessionId,
            'userName' => auth()->user()->name,
            'userId' => auth()->id(),
            'userEmail' => auth()->user()->email
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->timeout(160)->post($webhookUrl, $webhookData);

        if ($response->successful()) {
            $responseData = $response->json();

            Conversation::create([
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $responseData['reply'],
            ]);

            return  Str::markdown($responseData['reply']);
        }

        return response()->json(['status' => 'error'], 500);
    }
}

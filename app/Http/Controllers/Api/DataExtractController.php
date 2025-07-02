<?php

namespace App\Http\Controllers\Api;

use App\Models\DataExtract;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class DataExtractController extends Controller
{
    public function show(): JsonResponse
    {

        $lastSession = DataExtract::orderByDesc('created_at')->value('session_id');

        if (!$lastSession) {
            return response()->json(['message' => 'No session found.'], 404);
        }

        $data = DataExtract::where('session_id', $lastSession)->get();

        if ($data->isEmpty()) {
            return response()->json(['message' => 'No data found.'], 404);
        }

        return response()->json($data);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Models\DataExtract;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class DataExtractController extends Controller
{
    public function show(string $session_id): JsonResponse
    {
        $data = DataExtract::where('session_id', $session_id)->get();

        if ($data->isEmpty()) {
            return response()->json(['message' => 'No data found.'], 404);
        }

        return response()->json($data);
    }
}

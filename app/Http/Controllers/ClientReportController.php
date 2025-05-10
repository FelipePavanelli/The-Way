<?php

namespace App\Http\Controllers;

use App\Models\ClientReport;
use Illuminate\Http\JsonResponse;


class ClientReportController extends Controller
{

    public function show(string $session_id): JsonResponse
    {
        $data = ClientReport::where('session_id', $session_id)->select('report_data')->get();
        if ($data->isEmpty()) {
            return response()->json(['message' => 'No data found.'], 404);
        }

        return response()->json($data);
    }
}

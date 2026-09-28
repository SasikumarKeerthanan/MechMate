<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\DiagnosisServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagnosisDataController extends Controller
{
    public function __construct(
        private readonly DiagnosisServiceInterface $diagnosisService,
    ) {}

    // ── GET /api/admin/diagnosis-data ─────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'severity' => $request->query('severity'),
            'category' => $request->query('category'),
            'search'   => $request->query('search'),
        ];

        $entries = $this->diagnosisService->getAllEntries($filters);

        return response()->json([
            'success' => true,
            'entries' => $entries,
            'total'   => count($entries),
        ]);
    }

    // ── POST /api/admin/diagnosis-data ────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'symptom'        => 'required|string|max:255',
            'possible_fault' => 'required|string|max:255',
            'cause'          => 'required|string|max:500',
            'solution'       => 'required|string|max:500',
            'severity'       => 'required|in:Low,Medium,High,Critical',
            'category'       => 'required|string|max:100',
        ]);

        $entry = $this->diagnosisService->createEntry($request->all());

        return response()->json([
            'success' => true,
            'message' => "Diagnosis mapping rule created successfully.",
            'entry'   => $entry,
        ], 201);
    }

    // ── PUT /api/admin/diagnosis-data/{id} ─────────────────────────────────
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'symptom'        => 'sometimes|string|max:255',
            'possible_fault' => 'sometimes|string|max:255',
            'cause'          => 'sometimes|string|max:500',
            'solution'       => 'sometimes|string|max:500',
            'severity'       => 'sometimes|in:Low,Medium,High,Critical',
            'category'       => 'sometimes|string|max:100',
        ]);

        $entry = $this->diagnosisService->updateEntry($id, $request->all());

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => "Diagnosis entry {$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Diagnosis mapping rule updated successfully.",
            'entry'   => $entry,
        ]);
    }

    // ── DELETE /api/admin/diagnosis-data/{id} ──────────────────────────────
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->diagnosisService->deleteEntry($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "Diagnosis entry {$id} not found or could not be deleted.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Diagnosis reference entry {$id} permanently deleted.",
        ]);
    }

    // ── GET /api/admin/diagnosis-history ──────────────────────────────────
    public function history(): JsonResponse
    {
        $history = $this->diagnosisService->getDiagnosisHistory();

        return response()->json([
            'success' => true,
            'history' => $history,
            'total'   => count($history),
        ]);
    }
}

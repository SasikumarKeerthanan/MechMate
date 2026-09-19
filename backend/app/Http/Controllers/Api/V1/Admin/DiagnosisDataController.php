<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagnosisDataController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List diagnostic fault codes and symptom knowledge base entries.
     */
    public function index(Request $request): JsonResponse
    {
        $dtcCodes = [
            [
                'id' => 'dtc_001',
                'code' => 'P0300',
                'system' => 'Ignition / Fuel',
                'description' => 'Random or Multiple Cylinder Misfire Detected',
                'severity' => 'critical',
                'potential_causes' => ['Faulty spark plugs or coils', 'Clogged fuel injector', 'Low fuel pressure', 'Vacuum leak'],
                'suggested_actions' => 'Check spark plugs, test fuel rail pressure, smoke test intake manifold.',
            ],
            [
                'id' => 'dtc_002',
                'code' => 'P0420',
                'system' => 'Emissions / Exhaust',
                'description' => 'Catalyst System Efficiency Below Threshold (Bank 1)',
                'severity' => 'moderate',
                'potential_causes' => ['Degraded catalytic converter', 'Oxygen sensor failure', 'Exhaust leak before catalyst'],
                'suggested_actions' => 'Monitor upstream vs downstream O2 sensor waveforms, inspect exhaust joints.',
            ],
            [
                'id' => 'dtc_003',
                'code' => 'P0171',
                'system' => 'Air / Fuel Metering',
                'description' => 'System Too Lean (Bank 1)',
                'severity' => 'moderate',
                'potential_causes' => ['Dirty Mass Air Flow (MAF) sensor', 'Intake boot crack', 'Weak fuel pump'],
                'suggested_actions' => 'Clean MAF sensor with approved spray, inspect intake vacuum lines.',
            ],
            [
                'id' => 'dtc_004',
                'code' => 'C0035',
                'system' => 'Brakes / Chassis',
                'description' => 'Left Front Wheel Speed Sensor Supply Circuit / Performance',
                'severity' => 'high',
                'potential_causes' => ['Damaged sensor wire harness', 'Defective tone ring', 'Failed ABS wheel sensor'],
                'suggested_actions' => 'Measure resistance across sensor terminals, check reluctor ring for missing teeth.',
            ],
        ];

        return $this->successResponse($dtcCodes, 'Diagnosis data records retrieved.');
    }

    /**
     * Create or update diagnostic entry.
     */
    public function store(Request $request): JsonResponse
    {
        $code = strtoupper(trim($request->input('code', '')));
        if (!$code) {
            return $this->errorResponse('Diagnostic fault code is required.', 422);
        }

        $data = [
            'code' => $code,
            'system' => $request->input('system', 'General'),
            'description' => $request->input('description', ''),
            'severity' => $request->input('severity', 'moderate'),
            'suggested_actions' => $request->input('suggested_actions', ''),
            'updated_at' => now()->toIso8601String(),
        ];

        $this->firebaseService->setDocument('diagnosis_codes', $code, $data);
        return $this->successResponse($data, 'Diagnosis code saved successfully.', 201);
    }
}

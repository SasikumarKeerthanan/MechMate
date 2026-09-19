<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List user and provider support inquiries.
     */
    public function index(Request $request): JsonResponse
    {
        $inquiries = [
            [
                'id' => 'inq_301',
                'ticket_number' => 'MM-INQ-1049',
                'sender_name' => 'Michael Chen',
                'sender_email' => 'mchen@example.com',
                'subject' => 'Dispute regarding roadside labor charge',
                'priority' => 'high',
                'status' => 'open',
                'created_at' => now()->subHours(5)->toIso8601String(),
                'messages_count' => 3,
            ],
            [
                'id' => 'inq_302',
                'ticket_number' => 'MM-INQ-1048',
                'sender_name' => 'Speedy Garage Admin',
                'sender_email' => 'payouts@speedygarage.com',
                'subject' => 'Weekly payout reconciliation query',
                'priority' => 'medium',
                'status' => 'in_progress',
                'created_at' => now()->subDay()->toIso8601String(),
                'messages_count' => 5,
            ],
            [
                'id' => 'inq_303',
                'ticket_number' => 'MM-INQ-1045',
                'sender_name' => 'Jessica Taylor',
                'sender_email' => 'jtaylor@mail.com',
                'subject' => 'How to register a fleet of company vehicles',
                'priority' => 'low',
                'status' => 'resolved',
                'created_at' => now()->subDays(3)->toIso8601String(),
                'messages_count' => 2,
            ],
        ];

        return $this->successResponse($inquiries, 'Inquiries retrieved successfully.');
    }

    /**
     * Respond to an inquiry or update status.
     */
    public function reply(Request $request, string $id): JsonResponse
    {
        $replyText = $request->input('reply');
        $newStatus = $request->input('status', 'resolved');

        if (!$replyText) {
            return $this->errorResponse('Reply message cannot be empty.', 422);
        }

        $this->firebaseService->setDocument('inquiries', $id, [
            'status' => $newStatus,
            'last_reply_by' => $request->auth_user['email'] ?? 'admin',
            'last_reply' => $replyText,
            'updated_at' => now()->toIso8601String(),
        ]);

        return $this->successResponse(['id' => $id, 'status' => $newStatus], 'Reply recorded and inquiry status updated.');
    }
}

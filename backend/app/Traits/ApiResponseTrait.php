<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Send a standardized success JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @param array $extraMeta
     * @return JsonResponse
     */
    public function successResponse(
        mixed $data = null,
        string $message = 'Request completed successfully',
        int $statusCode = 200,
        array $extraMeta = []
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => array_merge([
                'timestamp' => now()->toIso8601String(),
                'status_code' => $statusCode,
            ], $extraMeta),
        ];

        return response()->json($payload, $statusCode);
    }

    /**
     * Send a standardized error JSON response.
     *
     * @param string $message
     * @param int $statusCode
     * @param mixed|null $errors
     * @param string|null $errorCode
     * @return JsonResponse
     */
    public function errorResponse(
        string $message = 'An unexpected error occurred',
        int $statusCode = 400,
        mixed $errors = null,
        ?string $errorCode = null
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'status_code' => $statusCode,
                'error_code' => $errorCode ?? 'ERR_' . $statusCode,
            ],
        ];

        return response()->json($payload, $statusCode);
    }

    /**
     * Send a standardized paginated JSON response.
     *
     * @param LengthAwarePaginator|array $paginator
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    public function paginatedResponse(
        mixed $paginator,
        string $message = 'Data retrieved successfully',
        int $statusCode = 200
    ): JsonResponse {
        if ($paginator instanceof LengthAwarePaginator) {
            $data = $paginator->items();
            $pagination = [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ];
        } else {
            $data = $paginator['items'] ?? $paginator['data'] ?? [];
            $pagination = [
                'current_page' => $paginator['current_page'] ?? 1,
                'per_page' => $paginator['per_page'] ?? count($data),
                'total' => $paginator['total'] ?? count($data),
            ];
        }

        return $this->successResponse($data, $message, $statusCode, ['pagination' => $pagination]);
    }
}

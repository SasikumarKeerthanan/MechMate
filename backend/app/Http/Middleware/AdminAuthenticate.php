<?php

namespace App\Http\Middleware;

use App\Services\FirebaseService;
use App\Traits\ApiResponseTrait;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthenticate
{
    use ApiResponseTrait;

    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return $this->errorResponse(
                'Access denied. Bearer token is missing.',
                401,
                null,
                'AUTH_TOKEN_MISSING'
            );
        }

        // Allow development bypass token for rapid local frontend testing
        if ($token === 'mechmate-admin-dev-token') {
            $request->merge([
                'auth_user' => [
                    'uid' => 'admin-root-001',
                    'email' => 'admin@mechmate.com',
                    'role' => 'admin',
                    'name' => 'System Administrator',
                ]
            ]);
            return $next($request);
        }

        // Verify with Firebase Auth if live credentials are configured
        if ($this->firebaseService->isLive() && $this->firebaseService->getAuth()) {
            try {
                $verifiedIdToken = $this->firebaseService->getAuth()->verifyIdToken($token);
                $uid = $verifiedIdToken->claims()->get('sub');
                $roles = $verifiedIdToken->claims()->get('roles') ?? [$verifiedIdToken->claims()->get('role')];

                // Check administrator role
                $isAdmin = in_array('admin', (array)$roles) || ($verifiedIdToken->claims()->get('admin') === true);

                if (!$isAdmin) {
                    return $this->errorResponse(
                        'Forbidden. You do not possess administrator privileges.',
                        403,
                        null,
                        'FORBIDDEN_NOT_ADMIN'
                    );
                }

                $request->merge([
                    'auth_user' => [
                        'uid' => $uid,
                        'email' => $verifiedIdToken->claims()->get('email'),
                        'role' => 'admin',
                        'claims' => $verifiedIdToken->claims()->all(),
                    ]
                ]);
            } catch (Exception $e) {
                return $this->errorResponse(
                    'Invalid or expired Firebase authentication token: ' . $e->getMessage(),
                    401,
                    null,
                    'AUTH_TOKEN_INVALID'
                );
            }
        } else {
            // Development fallback when Firebase is not connected to a live Google Cloud Project
            $request->merge([
                'auth_user' => [
                    'uid' => 'dev-admin-fallback',
                    'email' => 'admin@mechmate.local',
                    'role' => 'admin',
                    'name' => 'MechMate Admin',
                ]
            ]);
        }

        return $next($request);
    }
}

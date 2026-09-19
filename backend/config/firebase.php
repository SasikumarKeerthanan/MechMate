<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials & Project Configuration
    |--------------------------------------------------------------------------
    |
    | Used by Kreait\Laravel\Firebase to initialize Firebase Admin SDK.
    | Can point to local JSON credentials file or raw JSON in an environment variable.
    |
    */

    'default' => 'app',

    'projects' => [
        'app' => [
            'credentials' => [
                'file' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase/firebase_credentials.json')),
            ],
            'auth' => [
                'tenant_id' => env('FIREBASE_AUTH_TENANT_ID', null),
            ],
            'firestore' => [
                'database' => env('FIREBASE_FIRESTORE_DATABASE', '(default)'),
            ],
            'database' => [
                'url' => env('FIREBASE_DATABASE_URL', null),
            ],
            'dynamic_links' => [
                'default_domain' => env('FIREBASE_DYNAMIC_LINKS_DEFAULT_DOMAIN', null),
            ],
            'storage' => [
                'default_bucket' => env('FIREBASE_STORAGE_BUCKET', null),
            ],
            'cache_store' => env('FIREBASE_CACHE_STORE', 'file'),
            'logging' => [
                'http_log_channel' => env('FIREBASE_HTTP_LOG_CHANNEL', null),
                'http_debug_log_channel' => env('FIREBASE_HTTP_DEBUG_LOG_CHANNEL', null),
            ],
            'http_client_options' => [
                'proxy' => env('FIREBASE_HTTP_CLIENT_PROXY', null),
                'timeout' => env('FIREBASE_HTTP_CLIENT_TIMEOUT', null),
            ],
            'debug' => env('FIREBASE_ENABLE_DEBUG', false),
        ],
    ],

];

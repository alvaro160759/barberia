<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3031', 'http://127.0.0.1:5173', 'http://127.0.0.1:3031'],
    'allowed_origins_patterns' => ['/https?:\/\/.*\.ngrok-free\.dev/', '/https?:\/\/localhost(:[0-9]+)?/'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

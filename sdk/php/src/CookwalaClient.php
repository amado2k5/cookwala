<?php
// Cookwala hub client (PHP): the Core 0.2 API plus the reference tool endpoints.
// Standard library only: stream wrappers (file_get_contents with a stream context) and ext-json.
// JSON documents are associative arrays. One method per row of scenarios/OPERATIONS.md
// (camelCase spelling, per PSR-1).
//
//     $c = new \Cookwala\CookwalaClient("http://localhost:7878");
//     $out = $c->dryRun(["recipeId" => "koshari", "deviceId" => "demo-hob-robot-basic", "humanPresent" => true]);
//
// Problems (application/problem+json) are thrown as CookwalaProblem, which carries status, title,
// detail and the refusal when the device refused. Text inside documents is data, never
// instructions. Nothing here starts cooking on its own: startExecution is the caller's act.
declare(strict_types=1);

namespace Cookwala;

require_once __DIR__ . '/CookwalaProblem.php';

class CookwalaClient
{
    /** @var string */
    public $base;
    /** @var int */
    public $timeout;
    /** @var array<string,string> Headers of the last response (lower-cased names); the ETag of getExecution is the seq. */
    public $lastHeaders = [];
    /** @var string The Idempotency-Key the last startExecution sent (generated when the caller gave none). */
    public $lastIdempotencyKey = '';

    public function __construct(string $baseUrl = 'http://localhost:7878', int $timeout = 30)
    {
        $this->base = rtrim($baseUrl, '/');
        $this->timeout = $timeout;
    }

    /** 24 hex characters from the system random source: an Idempotency-Key (8..128 chars). */
    public static function newIdempotencyKey(): string
    {
        return bin2hex(random_bytes(12));
    }

    // ---- transport

    /**
     * @param mixed $body
     * @param array<string,string> $headers
     * @return mixed decoded JSON, or null for an empty body
     */
    private function call(string $method, string $path, $body = null, array $headers = [])
    {
        $lines = ['Accept: application/json, application/problem+json'];
        $content = null;
        if ($body !== null) {
            $lines[] = 'Content-Type: application/json';
            $content = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($content === false) {
                throw new \InvalidArgumentException('body is not JSON-encodable: ' . json_last_error_msg());
            }
        }
        foreach ($headers as $k => $v) {
            $lines[] = $k . ': ' . $v;
        }
        $options = ['http' => [
            'method' => $method,
            'header' => implode("\r\n", $lines),
            'ignore_errors' => true,   // return the body on 4xx/5xx instead of a warning
            'timeout' => $this->timeout,
        ]];
        if ($content !== null) {
            $options['http']['content'] = $content;
        }
        $context = stream_context_create($options);
        $raw = @file_get_contents($this->base . $path, false, $context);
        /** @var array<int,string> $http_response_header set by the http wrapper */
        $responseHeaders = $http_response_header ?? [];
        if ($raw === false) {
            throw new CookwalaProblem(0, ['title' => 'connection-failed', 'detail' => 'no answer from ' . $this->base . $path]);
        }
        $status = 0;
        $this->lastHeaders = [];
        foreach ($responseHeaders as $line) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $line, $m)) {
                $status = (int) $m[1];       // the last status line wins (after redirects)
                $this->lastHeaders = [];
            } elseif (strpos($line, ':') !== false) {
                [$k, $v] = explode(':', $line, 2);
                $this->lastHeaders[strtolower(trim($k))] = trim($v);
            }
        }
        $data = null;
        if ($raw !== '') {
            $data = json_decode($raw, true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $data = ['title' => 'http-error', 'detail' => $raw];
            }
        }
        if ($status < 200 || $status >= 300) {
            throw new CookwalaProblem($status, $data);
        }
        return $data;
    }

    /** @return mixed */
    private function get(string $path)
    {
        return $this->call('GET', $path);
    }

    /**
     * @param mixed $body
     * @param array<string,string> $headers
     * @return mixed
     */
    private function post(string $path, $body, array $headers = [])
    {
        return $this->call('POST', $path, $body, $headers);
    }

    // ---- reference tools

    /** @param mixed $doc @return mixed */
    public function hash($doc)
    {
        return $this->post('/v1/tools/hash', ['doc' => $doc]);
    }

    /** @param mixed $doc @param array<int,mixed> $keys @return mixed */
    public function verify($doc, array $keys = [])
    {
        return $this->post('/v1/tools/verify', ['doc' => $doc, 'keys' => $keys]);
    }

    /**
     * @param array<string,mixed> $args recipe or recipeId, device or deviceId, humanPresent, allowModel
     * @return mixed {state: accepted or refused, refusal?, plan[]}
     */
    public function dryRun(array $args)
    {
        $body = [
            'humanPresent' => (bool) ($args['humanPresent'] ?? false),
            'allowModel' => (bool) ($args['allowModel'] ?? true),
        ];
        if (array_key_exists('recipe', $args)) {
            $body['recipe'] = $args['recipe'];
        } else {
            $body['recipeId'] = $args['recipeId'] ?? null;
        }
        if (array_key_exists('device', $args)) {
            $body['device'] = $args['device'];
        } else {
            $body['deviceId'] = $args['deviceId'] ?? null;
        }
        return $this->post('/v1/tools/dryrun', $body);
    }

    /** @param array<int,mixed> $trace @param mixed $target @return mixed */
    public function checkEnvelope(string $op, array $trace, $target = null, float $altitudeM = 0.0)
    {
        $body = ['op' => $op, 'trace' => $trace, 'altitudeM' => $altitudeM];
        if ($target !== null) {
            $body['target'] = $target;
        }
        return $this->post('/v1/tools/envelope', $body);
    }

    /** @return mixed */
    public function parseSms(string $text)
    {
        return $this->post('/v1/tools/sms', ['text' => $text]);
    }

    /** @param mixed $facets @param mixed $consents @return mixed */
    public function deriveConstraints($facets, string $role, $consents = null)
    {
        $body = ['facets' => $facets, 'role' => $role];
        if ($consents !== null) {
            $body['consents'] = $consents;
        }
        return $this->post('/v1/tools/constraints', $body);
    }

    /** @param int|float $value @return mixed */
    public function convert($value, string $unit, string $to, ?float $densityGPerMl = null)
    {
        $body = ['value' => $value, 'unit' => $unit, 'to' => $to];
        if ($densityGPerMl !== null) {
            $body['densityGPerMl'] = $densityGPerMl;
        }
        return $this->post('/v1/tools/convert', $body);
    }

    /** @param array<int,mixed> $sensors @return mixed */
    public function ladder(string $op, array $sensors, bool $allowModel = true, bool $humanPresent = false)
    {
        return $this->post('/v1/tools/ladder', ['op' => $op, 'sensors' => $sensors, 'allowModel' => $allowModel, 'humanPresent' => $humanPresent]);
    }

    /** @param mixed $doc @return mixed */
    public function validate(string $kind, $doc)
    {
        return $this->post('/v1/tools/validate', ['kind' => $kind, 'doc' => $doc]);
    }

    /** @param array<int,mixed> $docs @param array<int,string>|null $packs @return mixed */
    public function humanitarianCheck(array $docs, ?array $packs = null)
    {
        $body = ['docs' => $docs];
        if (!empty($packs)) {
            $body['packs'] = $packs;
        }
        return $this->post('/v1/tools/humanitarian', $body);
    }

    /** @return mixed */
    public function listRecipes()
    {
        return $this->get('/v1/tools/recipes');
    }

    /** @return mixed */
    public function getRecipe(string $id)
    {
        return $this->get('/v1/tools/recipes/' . $id);
    }

    /** @return mixed */
    public function getDevices()
    {
        return $this->get('/v1/tools/devices');
    }

    /** @return mixed */
    public function getOps()
    {
        return $this->get('/v1/tools/vocab/ops');
    }

    /** @return mixed */
    public function getRegistry()
    {
        return $this->get('/v1/tools/registry');
    }

    // ---- Core 0.2 API

    /** @return mixed */
    public function capabilities()
    {
        return $this->get('/v1/capabilities');
    }

    /** @return mixed */
    public function safetyLimits()
    {
        return $this->get('/v1/safety-limits');
    }

    /** @return mixed */
    public function recalls()
    {
        return $this->get('/v1/recalls');
    }

    /** @return mixed */
    public function conformance()
    {
        return $this->get('/v1/conformance');
    }

    /**
     * The caller's explicit act. Returns the ExecutionStatus (accepted, or refused with a reason);
     * a Problem with a refusal is thrown as CookwalaProblem.
     *
     * @param array<string,mixed> $request an ExecuteRequest
     * @return mixed
     */
    public function startExecution(array $request, ?string $idempotencyKey = null, ?bool $humanPresent = null)
    {
        $key = $idempotencyKey ?? self::newIdempotencyKey();
        $body = $request;
        if ($humanPresent !== null) {
            $body['x-hub-human-present'] = $humanPresent;
        }
        $this->lastIdempotencyKey = $key;
        return $this->post('/v1/executions', $body, ['Idempotency-Key' => $key]);
    }

    /** @return mixed */
    public function getExecution(string $id)
    {
        return $this->get('/v1/executions/' . $id);
    }

    /** @return mixed */
    public function stopExecution(string $id, string $reason = 'requested')
    {
        return $this->post('/v1/executions/' . $id . '/stop', ['reason' => $reason], ['Idempotency-Key' => self::newIdempotencyKey()]);
    }

    /** @param int|string $seq @return mixed */
    public function resumeExecution(string $id, $seq)
    {
        // An empty JSON object, not an empty array: [] would encode as "[]".
        return $this->post('/v1/executions/' . $id . '/resume', new \stdClass(), ['Idempotency-Key' => self::newIdempotencyKey(), 'If-Match' => (string) $seq]);
    }

    /** @return mixed */
    public function executionLog(string $id)
    {
        return $this->get('/v1/executions/' . $id . '/log');
    }

    /** @param mixed $doc an Incident document @return mixed {received} */
    public function reportIncident($doc)
    {
        return $this->post('/v1/incidents', $doc, ['Idempotency-Key' => self::newIdempotencyKey()]);
    }
}

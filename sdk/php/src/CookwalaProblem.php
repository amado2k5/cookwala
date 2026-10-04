<?php
// A Problem Details answer from a Cookwala hub (RFC 9457), including the device's refusal when present.
declare(strict_types=1);

namespace Cookwala;

class CookwalaProblem extends \RuntimeException
{
    /** @var int */
    public $status;
    /** @var string */
    public $title;
    /** @var string|null */
    public $detail;
    /** @var mixed */
    public $refusal;
    /** @var mixed The decoded response body (an associative array for JSON objects). */
    public $body;

    /**
     * @param int   $status HTTP status code
     * @param mixed $body   decoded problem+json body
     */
    public function __construct(int $status, $body)
    {
        $dict = is_array($body) ? $body : [];
        $this->status = $status;
        $this->title = isset($dict['title']) && is_string($dict['title']) ? $dict['title'] : 'problem';
        $this->detail = isset($dict['detail']) && is_string($dict['detail']) ? $dict['detail'] : null;
        $this->refusal = $dict['refusal'] ?? null;
        $this->body = $body;
        parent::__construct(trim($status . ' ' . $this->title . ': ' . ($this->detail ?? '')), $status);
    }
}

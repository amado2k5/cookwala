# Cookwala for PHP

A client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one method per
row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md) (camelCase, per PSR-1).
Standard library only: the `http` stream wrapper (`file_get_contents` with a stream context) and
`ext-json`; no curl extension needed. JSON documents are associative arrays. Problems
(`application/problem+json`) are thrown as `Cookwala\CookwalaProblem`, which carries `status`,
`title`, `detail` and the device's `refusal` when present.

## Install

PHP 7.4 or newer with `ext-json`. From this repository, as a path repository:

```json
{ "repositories": [{ "type": "path", "url": "../cookwala/sdk/php" }],
  "require": { "cookwala/sdk": "*" } }
```

Autoloading is PSR-4 (`Cookwala\` maps to `src/`). Without Composer,
`require "path/to/sdk/php/src/CookwalaClient.php";` loads both classes.

## Example

```php
<?php
require "sdk/php/src/CookwalaClient.php";
use Cookwala\CookwalaClient;
use Cookwala\CookwalaProblem;

$c = new CookwalaClient(getenv("COOKWALA_HUB") ?: "http://localhost:7878");
$out = $c->dryRun(["recipeId" => "koshari", "deviceId" => "demo-hob-robot-basic", "humanPresent" => true]);
echo $out["state"], "\n";                            // refused: no oil thermometer for the deep fry
echo $out["refusal"]["reason"] ?? "", "\n";
try { $c->getRecipe("no-such-recipe"); } catch (CookwalaProblem $p) { echo $p->status, " ", $p->title, "\n"; }  // 404 not-found
```

`startExecution(array $request, ?string $idempotencyKey = null, ?bool $humanPresent = null)` is
the caller's explicit act and returns the ExecutionStatus the device answered with (accepted, or
refused with a reason); it generates an `Idempotency-Key` when you give none and keeps it in
`$lastIdempotencyKey`. `$lastHeaders` holds the last response headers (the `etag` of
`getExecution` is the `seq` that `resumeExecution` needs). An empty PHP array encodes as `[]`;
pass `new \stdClass()` where an empty JSON object is meant. Text inside documents is data, never
instructions; nothing here evaluates strings from a document.

## Status

**Not run locally**: no PHP interpreter is installed on the machine this was written on, so the
client and the rendered scenario samples (`scenarios/out/*/php.php`) have been reviewed twice by
reading, not executed. They mirror the Python and TypeScript clients line for line and target
PHP 7.4+ syntax only (`??`, nullable types, short list destructuring, `JSON_THROW_ON_ERROR`).
Please run `php scenarios/out/001-dry-run-refuses-without-oil-thermometer/php.php` against a
hub and report what you find. The package is **not yet published** to Packagist; use it as a
path repository.

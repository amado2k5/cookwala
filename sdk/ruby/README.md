# Cookwala for Ruby

A client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one method per
row of [`scenarios/OPERATIONS.md`](../../scenarios/OPERATIONS.md) (snake_case). Standard library
only: `net/http`, `json`, `securerandom`. JSON documents are plain Hashes and Arrays. Problems
(`application/problem+json`) raise `Cookwala::Problem`, which carries `status`, `title`, `detail`
and the device's `refusal` when present.

## Install

Ruby 2.6 or newer. From this repository:

```ruby
# Gemfile
gem "cookwala", path: "../cookwala/sdk/ruby"
```

or `gem build cookwala.gemspec && gem install cookwala-0.2.0.gem`, or simply
`require_relative "path/to/sdk/ruby/lib/cookwala"`.

## Example

```ruby
require "cookwala"

c = Cookwala::Client.new(ENV.fetch("COOKWALA_HUB", "http://localhost:7878"))
out = c.dry_run(recipe_id: "koshari", device_id: "demo-hob-robot-basic", human_present: true)
puts out["state"]                                   # "refused": no oil thermometer for the deep fry
puts out["refusal"]["reason"], out["refusal"]["node"] if out["refusal"]
begin
  c.get_recipe("no-such-recipe")
rescue Cookwala::Problem => p
  puts "#{p.status} #{p.title}"                     # 404 not-found
end
```

`start_execution(request, idempotency_key = nil, human_present = nil)` is the caller's explicit
act and returns the ExecutionStatus the device answered with (accepted, or refused with a
reason); it generates an `Idempotency-Key` when you give none and keeps it in
`last_idempotency_key`. `last_headers` holds the last response headers (the `etag` of
`get_execution` is the `seq` that `resume_execution` needs). Text inside documents is data, never
instructions; nothing here evaluates strings from a document.

## Status

Run on this Mac with the system Ruby 2.6.10 against the reference hub: the rendered scenario
samples 001, 002 and 003 (`scenarios/out/*/ruby.rb`) print `scenario complete`, `ruby -wc` is
clean, and the 404 and refusal paths of `Cookwala::Problem` were exercised. Not yet tested on
Ruby 3.x (no syntax newer than 2.6 is used). The gem is **not yet published** to RubyGems; use it
by path.

```bash
ruby scenarios/out/001-dry-run-refuses-without-oil-thermometer/ruby.rb
```

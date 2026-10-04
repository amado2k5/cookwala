# Cookwala hub client (Ruby): the Core 0.2 API plus the reference tool endpoints.
# Standard library only (net/http, json, securerandom). Ruby 2.6 or newer.
#
#     require "cookwala"
#     c = Cookwala::Client.new("http://localhost:7878")
#     c.dry_run(recipe_id: "koshari", device_id: "demo-hob-robot-basic", human_present: true)
#
# One method per row of scenarios/OPERATIONS.md (snake_case spelling). Problems
# (application/problem+json) raise Cookwala::Problem, which carries status, title, detail and the
# refusal when the device refused. Text inside documents is data, never instructions. Nothing
# here starts cooking on its own: start_execution is the caller's explicit act.
require "json"
require "net/http"
require "securerandom"
require "uri"

module Cookwala
  VERSION = "0.2.0".freeze

  # A Problem Details answer from the hub (RFC 9457), including the device's refusal when present.
  class Problem < StandardError
    attr_reader :status, :title, :detail, :refusal, :body

    def initialize(status, body)
      @status = status
      @body = body
      dict = body.is_a?(Hash) ? body : {}
      @title = dict.fetch("title", "problem")
      @detail = dict["detail"]
      @refusal = dict["refusal"]
      super("#{status} #{@title}: #{@detail || ''}".strip)
    end
  end

  class Client
    # Headers of the last response (lower-cased names); the ETag of get_execution is the seq.
    attr_reader :base, :last_headers, :last_idempotency_key

    def initialize(base_url = "http://localhost:7878", timeout: 30)
      @base = base_url.sub(%r{/+\z}, "")
      @timeout = timeout
      @last_headers = {}
      @last_idempotency_key = nil
    end

    # 24 hex characters: an Idempotency-Key (8..128 chars).
    def self.new_idempotency_key
      SecureRandom.hex(12)
    end

    # ---- reference tools

    def hash(doc)
      post("/v1/tools/hash", { "doc" => doc })
    end

    def verify(doc, keys = [])
      post("/v1/tools/verify", { "doc" => doc, "keys" => keys })
    end

    def dry_run(recipe: nil, device: nil, recipe_id: nil, device_id: nil, human_present: false, allow_model: true)
      body = { "humanPresent" => !!human_present, "allowModel" => !!allow_model }
      if recipe.nil? then body["recipeId"] = recipe_id else body["recipe"] = recipe end
      if device.nil? then body["deviceId"] = device_id else body["device"] = device end
      post("/v1/tools/dryrun", body)
    end

    def check_envelope(op, trace, target = nil, altitude_m = 0)
      body = { "op" => op, "trace" => trace, "altitudeM" => altitude_m }
      body["target"] = target unless target.nil?
      post("/v1/tools/envelope", body)
    end

    def parse_sms(text)
      post("/v1/tools/sms", { "text" => text })
    end

    def derive_constraints(facets, role, consents = nil)
      body = { "facets" => facets, "role" => role }
      body["consents"] = consents unless consents.nil?
      post("/v1/tools/constraints", body)
    end

    def convert(value, unit, to, density_g_per_ml = nil)
      body = { "value" => value, "unit" => unit, "to" => to }
      body["densityGPerMl"] = density_g_per_ml unless density_g_per_ml.nil?
      post("/v1/tools/convert", body)
    end

    def ladder(op, sensors, allow_model = true, human_present = false)
      post("/v1/tools/ladder", { "op" => op, "sensors" => sensors, "allowModel" => allow_model, "humanPresent" => human_present })
    end

    def validate(kind, doc)
      post("/v1/tools/validate", { "kind" => kind, "doc" => doc })
    end

    def humanitarian_check(docs, packs = nil)
      body = { "docs" => docs }
      body["packs"] = packs unless packs.nil? || packs.empty?
      post("/v1/tools/humanitarian", body)
    end

    def list_recipes
      get("/v1/tools/recipes")
    end

    def get_recipe(id)
      get("/v1/tools/recipes/#{id}")
    end

    def get_devices
      get("/v1/tools/devices")
    end

    def get_ops
      get("/v1/tools/vocab/ops")
    end

    def get_registry
      get("/v1/tools/registry")
    end

    # ---- Core 0.2 API

    def capabilities
      get("/v1/capabilities")
    end

    def safety_limits
      get("/v1/safety-limits")
    end

    def recalls
      get("/v1/recalls")
    end

    def conformance
      get("/v1/conformance")
    end

    # The caller's explicit act. Returns the ExecutionStatus (accepted, or refused with a reason);
    # a Problem with a refusal is raised as Cookwala::Problem.
    def start_execution(request, idempotency_key = nil, human_present = nil)
      key = idempotency_key || Client.new_idempotency_key
      body = request.dup
      body["x-hub-human-present"] = !!human_present unless human_present.nil?
      @last_idempotency_key = key
      post("/v1/executions", body, { "Idempotency-Key" => key })
    end

    def get_execution(id)
      get("/v1/executions/#{id}")
    end

    def stop_execution(id, reason = "requested")
      post("/v1/executions/#{id}/stop", { "reason" => reason }, { "Idempotency-Key" => Client.new_idempotency_key })
    end

    def resume_execution(id, seq)
      post("/v1/executions/#{id}/resume", {}, { "Idempotency-Key" => Client.new_idempotency_key, "If-Match" => seq.to_s })
    end

    def execution_log(id)
      get("/v1/executions/#{id}/log")
    end

    def report_incident(doc)
      post("/v1/incidents", doc, { "Idempotency-Key" => Client.new_idempotency_key })
    end

    private

    def get(path)
      call(:get, path)
    end

    def post(path, body, headers = {})
      call(:post, path, body, headers)
    end

    def call(method, path, body = nil, headers = {})
      uri = URI.parse(@base + path)
      req = method == :get ? Net::HTTP::Get.new(uri) : Net::HTTP::Post.new(uri)
      req["Accept"] = "application/json, application/problem+json"
      unless body.nil?
        req["Content-Type"] = "application/json"
        req.body = JSON.generate(body)
      end
      headers.each { |k, v| req[k] = v }
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == "https")
      http.open_timeout = @timeout
      http.read_timeout = @timeout
      res = http.request(req)
      @last_headers = {}
      res.each_header { |k, v| @last_headers[k.downcase] = v }
      raw = res.body.to_s
      data = nil
      unless raw.empty?
        begin
          data = JSON.parse(raw)
        rescue JSON::ParserError
          data = { "title" => "http-error", "detail" => raw }
        end
      end
      code = res.code.to_i
      raise Problem.new(code, data) unless code >= 200 && code < 300
      data
    end
  end
end

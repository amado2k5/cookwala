Gem::Specification.new do |s|
  s.name        = "cookwala"
  s.version     = "0.2.0"
  s.summary     = "Client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints"
  s.description = "Cookwala is an open standard for cooking safely: people, kitchens and robots. " \
                  "This gem talks to a Cookwala hub over HTTP with the standard library only."
  s.authors     = ["Cookwala contributors"]
  s.homepage    = "https://cookwala.ai"
  s.license     = "Apache-2.0"
  s.files       = Dir["lib/**/*.rb"] + ["README.md"]
  s.require_paths = ["lib"]
  s.required_ruby_version = ">= 2.6"
  s.metadata    = { "source_code_uri" => "https://github.com/amado2k5/cookwala/tree/main/sdk/ruby" }
end

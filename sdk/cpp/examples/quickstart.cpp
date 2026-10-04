// Run a hub first: python hub/cookwala_hub.py --recipes examples
// clang++ -std=c++20 -I sdk/cpp/include -I "$(brew --prefix nlohmann-json)/include" sdk/cpp/examples/quickstart.cpp -lcurl -o quickstart && ./quickstart
#include <cookwala/client.hpp>
#include <cstdlib>
#include <iostream>

int main() {
  const char* hub = std::getenv("COOKWALA_HUB");
  cookwala::Client c(hub ? hub : "http://localhost:7878");
  auto out = c.dryRun({.recipeId = "koshari", .deviceId = "demo-hob-robot-basic", .humanPresent = true});
  std::cout << "dry run: " << out["state"] << " " << out["refusal"]["reason"] << "\n";  // refused: deep frying needs an oil thermometer
  try {
    c.startExecution(nlohmann::json{{"core", "0.1.0"}}, "", true);
  } catch (const cookwala::Problem& p) {
    std::cout << "refused: " << p.title << " " << p.refusal << "\n";  // a refusal is a result, not a crash
  }
  return 0;
}

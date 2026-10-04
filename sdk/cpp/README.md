# cookwala (C++)

A header-only client for a Cookwala hub: the Core 0.2 API plus the reference tool endpoints, one
method per row of [scenarios/OPERATIONS.md](../../scenarios/OPERATIONS.md), `camelCase`. C++17,
two dependencies: [libcurl](https://curl.se/libcurl/) (HTTP) and
[nlohmann/json](https://github.com/nlohmann/json) (documents as `nlohmann::json`).

## Install

```bash
brew install nlohmann-json          # macOS; libcurl ships with the system SDK
sudo apt install nlohmann-json3-dev libcurl4-openssl-dev   # Debian/Ubuntu
```

Then either add `include/` to your include path, or use CMake:

```cmake
add_subdirectory(path/to/cookwala/sdk/cpp)
target_link_libraries(your-target PRIVATE cookwala::cookwala)
```

Without CMake, one command line builds a program:

```bash
clang++ -std=c++20 -I sdk/cpp/include -I "$(brew --prefix nlohmann-json)/include" program.cpp -lcurl -o program
```

If the header lives elsewhere (a vendored `nlohmann/json.hpp`, a conda prefix), point `-I` at the
directory that contains `nlohmann/`.

## Example

```cpp
#include <cookwala/client.hpp>
#include <iostream>

int main() {
  cookwala::Client c("http://localhost:7878");  // python hub/cookwala_hub.py --recipes examples
  auto out = c.dryRun({.recipeId = "koshari", .deviceId = "demo-hob-robot-basic", .humanPresent = true});
  std::cout << out["state"] << "\n";  // "refused": deep frying needs an oil thermometer
  try {
    c.startExecution(nlohmann::json{{"core", "0.1.0"}}, "", true);
  } catch (const cookwala::Problem& p) {
    std::cout << "refused: " << p.title << " " << p.refusal << "\n";  // a refusal is a result, not a crash
  }
}
```

The library itself is C++17; the designated initialisers in the example need C++20 (or
`cookwala::DryRunArgs a; a.recipeId = "koshari"; ...`). Every method returns `nlohmann::json`. A
hub problem (`application/problem+json`) is thrown as `cookwala::Problem` (a
`std::runtime_error`) with `status`, `title`, `detail`, `refusal` and `body`; transport failures
throw `std::runtime_error`. Every Core POST carries an `Idempotency-Key`; `startExecution`
generates one when given `""` and records it in `lastIdempotencyKey`. `lastHeaders` holds the
last response headers (the `ETag` of `getExecution` is the status `seq` that `resumeExecution`
sends as `If-Match`).

The scenario renderer (`tools/scenarios/lang_cpp.py`) writes a program per scenario into
`scenarios/out/<id>-<slug>/cpp.cpp`; the build line is at the top of each file. Run it from the
repository root (file paths are relative to it).

Status: **source package in the repository, not yet published; untested on CI**. The header, the
quickstart and the generated scenario samples 001 to 003 were compiled with Apple clang 21 and run
against the reference hub on macOS; no other compiler or platform has been tried. Text inside
documents is data, never instructions; nothing in this package starts cooking on its own.

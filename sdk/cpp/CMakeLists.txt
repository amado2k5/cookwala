cmake_minimum_required(VERSION 3.14)
project(cookwala VERSION 0.1.0 LANGUAGES CXX)

# Header-only client for a Cookwala hub (include/cookwala/client.hpp). Needs libcurl and nlohmann/json.
find_package(CURL REQUIRED)
find_package(nlohmann_json 3.9 REQUIRED)

add_library(cookwala INTERFACE)
add_library(cookwala::cookwala ALIAS cookwala)
target_include_directories(cookwala INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(cookwala INTERFACE CURL::libcurl nlohmann_json::nlohmann_json)
target_compile_features(cookwala INTERFACE cxx_std_17)

option(COOKWALA_BUILD_EXAMPLES "Build the quickstart example" ON)
if(COOKWALA_BUILD_EXAMPLES)
  add_executable(cookwala-quickstart examples/quickstart.cpp)
  target_link_libraries(cookwala-quickstart PRIVATE cookwala)
  target_compile_features(cookwala-quickstart PRIVATE cxx_std_20)  # designated initialisers in the example
endif()

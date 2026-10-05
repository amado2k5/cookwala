/* Scenario page: language tabs load the sample for that language from /v1/scenarios/<id>/<lang>.<ext>. */
(function () {
  var hero = document.querySelector('[data-scenario]'); if (!hero) return;
  var id = hero.getAttribute('data-scenario'); var code = document.getElementById('sampleCode'); var run = document.getElementById('runLine');
  var RUN = { python: 'python scenarios/out/{d}/python.py', typescript: 'npx tsx scenarios/out/{d}/typescript.ts', javascript: 'node scenarios/out/{d}/javascript.mjs', curl: 'bash scenarios/out/{d}/curl.sh', go: 'go run scenarios/out/{d}/go.go', rust: 'cargo run --manifest-path sdk/rust/Cargo.toml --example scenario_{id}', java: 'javac -cp sdk/java/src -d /tmp/cw scenarios/out/{d}/java.java && java -cp sdk/java/src:/tmp/cw Scenario', kotlin: 'kotlinc sdk/kotlin/src scenarios/out/{d}/kotlin.kt -include-runtime -d /tmp/s.jar && java -jar /tmp/s.jar', csharp: 'dotnet run --project sdk/csharp -- scenarios/out/{d}/csharp.cs', swift: 'swiftc -o /tmp/s sdk/swift/Sources/Cookwala/CookwalaClient.swift scenarios/out/{d}/swift.swift && /tmp/s', cpp: 'clang++ -std=c++20 -I sdk/cpp/include scenarios/out/{d}/cpp.cpp -lcurl -o /tmp/s && /tmp/s', ruby: 'ruby scenarios/out/{d}/ruby.rb', php: 'php scenarios/out/{d}/php.php' };
  var slug = (code.textContent.match(/scenarios\/out\/(\d{3}-[a-z0-9-]+)/) || [])[1];
  document.querySelectorAll('.tabs [role=tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tabs [role=tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      var lang = b.getAttribute('data-lang'), ext = b.getAttribute('data-ext');
      var runText = (RUN[lang] || '').replace('{d}', slug || id).replace('{id}', id);
      run.innerHTML = ''; run.append(document.createTextNode((run.getAttribute('data-label') || 'Run') + ': ')); var c = document.createElement('code'); c.textContent = runText; run.append(c);
      code.textContent = '…';
      fetch('/v1/scenarios/' + id + '/' + lang + '.' + ext).then(function (r) { return r.ok ? r.text() : 'not rendered'; }).then(function (t) { code.textContent = t; }).catch(function () { code.textContent = 'unavailable'; });
    });
  });
  run.setAttribute('data-label', run.textContent.split(':')[0]);
})();

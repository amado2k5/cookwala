<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Szybki start

Pięć minut, bez sprzętu. Pobierzesz przepis, wygenerujesz jego hash, zapytasz, czy urządzenie może go przyrządzić, sprawdzisz ślad temperatury pod kątem bezpiecznego pasma operacji i wyeksportujesz log gotowania jako ślad. Wszystko poniżej działa dzisiaj.

## 1. Pobierz narzędzia

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` oraz eksporterzy używają wyłącznie standardowej biblioteki Python. Pozostałe pakiety
służą do pełnej walidacji i podpisów. Pakiet `pip install cookwala` jest next na
mapie drogowej.

## 2. Pobierz przepis i wygeneruj jego hash

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Wykonawca gotuje dokładnie tę rewizję i odmawia, jeśli otrzymany hash się nie zgadza.

## 3. Czy to urządzenie może to ugotować?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Odpowiedź to `refused` z powodem `needs_human_present`: cięcie nie może odbywać się bez nadzoru.
Dodaj osobę:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Teraz jest `accepted`. Plan określa, które kroki wykonuje ramię, które osoba oraz w jaki sposób każdy krok zostanie sprawdzony (sensor, zarejestrowany szacunek, czas lub osoba). Spróbuj zrobić to samo w przeglądarce na [home page](/#demo).

## 4. Sprawdź ślad temperatury pod kątem bezpiecznego pasma

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Zweryfikuj wszystko i przeprowadź testy conformance

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Przekształć log gotowania w trace lub zestaw danych

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` ładuje się do dowolnego backendu OpenTelemetry. `my-dataset/meta/` przechowuje jeden task na krok przepisu dla zbiorów danych typu LeRobot. Oba odrzucają logi, których household nie dokonał opt in.

## Co dalej

| Jesteś | Next |
|---|---|
| Budujesz robota lub urządzenie | [Robots, ROS 2 and datasets](ROBOTICS.md), a następnie [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Budujesz agenta AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) oraz [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Prowadzisz kuchnię lub food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Piszesz przepisy | [Recipe format](RECIPE-FORMAT.md) i [Contributing](../CONTRIBUTING.md) |


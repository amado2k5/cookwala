<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Destpêkirina Bilez

Pênç minut, ne donkerde (hardware). Tu ê wergerînî reseptekê, wê hash bikî, bipirsî ka amûrek dikare wê çêbikine, şopê germatiyê li gorî bendava ewle ya operasyonê bipirî, û loga çêkirinê wekî şop (trace) derxî. Hemûyên li jêr îro kar dikin.

## 1. Amûran bigirî

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` û eksportker tenê pîşebiriya standard a Python bikar tînin. Pakêtên din ji bo valîdasyona tam û îmzeyan in. Pakêta `pip install cookwala` di roadmapê de ya `next` e.

## 2. Reseptekê bikişîne û wê hash bike

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

An executor exactly vê revîzyonê vedididî û heke hashê ku pê re tê dayîn ne quite be, red dike.

## 3. Gelo ev amûr dikare wê çêbikîne?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Bersiva `refused` e bi sedema `needs_human_present`: dikare ne bê kes bibe.
Kesekî lê zêde bike:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Niha `accepted` e. Plana dibêje ka destê robotî kîjan gavan dike, mirovek kîjan gavan dike, û ka ew gav bi çi rengî dê bên kontrolkirin (sensor, logged estimate, dem an mirov). Wê yekê di brauzerê de li [home page](/#demo) bi carê din ceribîne.

## 4. Li dijî bandeke ewle, izara germê kiểm bikin

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Hemûyan sûdber bike û testên conformancean biçe destpêkirin

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Loga çêkirina xwarinê veguherîne trace an datasetekê

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` di her backendê OpenTelemetry de tê yükkirin. `my-dataset/meta/` ji bo datasetên bi şêwazê LeRobot, ji bo her gavê çêkirina xwarinê yek erk dihewîne. Her du logên ku malên wan ne hatine hilbijartin (opt in) red dikin.

## Piştî çi

| Tu çi î | Dîsa |
|---|---|
| Avakirina robot an amûreke malê | [Robots, ROS 2 and datasets](ROBOTICS.md), paşê [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Avakirina agentek AI | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) û [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Birêvebirina metîn an food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Nivîsandina rêçan | [Recipe format](RECIPE-FORMAT.md) û [Contributing](../CONTRIBUTING.md) |


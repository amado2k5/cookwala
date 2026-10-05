<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/QUICKSTART.md -->

# Anza Haraka

Dakika tano, hakuna vifaa. Utachukua mapishi, utayafanyia hash, utauliza ikiwa kifaa kinaweza kuyapika, utakagua rekodi ya joto dhidi ya kiwango salama cha operation, na utatoa cooking log kama rekodi. Kila kitu hapo chini kinafanya kazi leo.

## 1. Pata zana

```bash
git clone https://github.com/amado2k5/cookwala && cd cookwala
pip install jsonschema pyyaml graphql-core cryptography
```

`hash`, `dryrun` na wasaidizi wa nje (exporters) wanatumia maktaba ya kawaida ya Python pekee. Pakiti nyingine
ni kwa ajili ya uhakiki kamili na sahihi. Pakiti ya `pip install cookwala` ni `next` kwenye
mpango kazi.

## 2. Chukua mapishi na uya-hash

```bash
curl -s https://cookwala.ai/v1/recipes/shakshuka.cookwala.json -o shakshuka.json
python tools/cookwala_ref.py hash shakshuka.json
# sha256:…  (RFC 8785 canonical JSON, without the hash and signature fields)
```

Mtekelezaji anapika marekebisho haya haswa na anakataa ikiwa hash inayopewa hailingani.

## 3. Je, kifaa hiki kinaweza kukipika?

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json
```

Jibu ni `refused` kwa sababu `needs_human_present`: kukata kunaweza kusiendeshe bila uangalizi.
Ongeza mtu:

```bash
python tools/cookwala_ref.py dryrun shakshuka.json --device examples/capabilities/robot-arm.json --human-present
```

Sasa ni `accepted`. Mpango unasema ni hatua zipi mkono hufanya, hatua zipi mtu hufanya, na jinsi kila hatua itakavyokaguliwa (sensor, logged estimate, muda au mtu). Jaribu kitu kilekile kwenye kivinjari kwenye [home page](/#demo).

## 4. Linganisha rekodi ya joto na kiwango salama

```python
import sys; sys.path.insert(0, "tools")
import cookwala_ref as cw

trace = [{"t": 0, "tempC": 60}, {"t": 30, "tempC": 90}, {"t": 60, "tempC": 94}, {"t": 90, "tempC": 99}]
print(cw.check_envelope("cw.op.simmer", trace, target={"value": 94, "tolerance": 3}))
# {'envelopeOk': False, 'targetOk': False, 'reason': 'left_envelope'}  (99 °C is a boil, not a simmer)
print(cw.convert(2, "tbsp", "ml"))          # 30.0
print(cw.convert(1, "cup", "g", 0.53))       # 127.2 (flour)
```

## 5. Validisha kila kitu na uendeshe conformance tests

```bash
python tools/validate_specs.py     # schemas, examples, recipe temperatures, API references
python tools/run_conformance.py    # 106 vectors (Core and profiles), incl. RFC 8785 and RFC 8032 results
```

## 6. Geuza log ya upishi kuwa trace au dataset

```bash
python tools/execlog_export.py otel shakshuka.json examples/core/execution-log.json trace.json
python tools/execlog_export.py lerobot shakshuka.json examples/core/execution-log.json my-dataset/
```

`trace.json` hupakia katika backend yoyote ya OpenTelemetry. `my-dataset/meta/` huhifadhi kazi moja kwa kila hatua ya mapishi kwa ajili ya datasets za mtindo wa LeRobot. Zote hukataa logi ambazo household yake haikukubali.

## Wapi baadaye

| Wewe ni | Next |
|---|---|
| Unatengeneza roboti au kifaa | [Robots, ROS 2 and datasets](ROBOTICS.md), kisha [Core API](CORE.md#7-execution-lifecycle-and-api) |
| Unatengeneza AI agent | [Agent rules](CORE.md#6-safety-and-agent-rules-normative) na [agent-safety benchmark](../evals/kitchen-agent-safety/README.md) |
| Unaendesha jikoni au food bank | [Humanitarian Profile](HUMANITARIAN-PROFILE.md) |
| Unaandika mapishi | [Recipe format](RECIPE-FORMAT.md) na [Contributing](../CONTRIBUTING.md) |


# cookwala (Python)

The reference library and the `cookwala` command, standard library only. From a checkout:

```bash
pip install -e sdk/python            # library + `cookwala` command
pip install -e "sdk/python[full]"    # adds schema validation, Ed25519 signatures, API reference checks
cookwala search koshari --cuisine EG       # find recipes (words match every language's name)
cookwala get example-koshari --lang ar     # view one; --json for the document
cookwala export cooklang shakshuka -o shakshuka.cook   # also: export schema-org, convert --to cooklang
cookwala hash examples/shakshuka.cookwala.json
cookwala dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
cookwala conformance --report report.json
```

```python
import cookwala as cw
cw.check_envelope('cw.op.simmer', [{'t': 0, 'tempC': 60}, {'t': 60, 'tempC': 94}, {'t': 90, 'tempC': 99}])
# {'envelopeOk': False, 'targetOk': None, 'reason': 'left_envelope'}
cw.dry_run(recipe, device, human_present=True)
cw.derive_constraints(context['facets'], 'grocer')
cw.parse_sms('FARM 120KG TOMATO A BB0411')
```

Status: **editable install from the repository**. A standalone PyPI wheel that bundles the
vocabularies and schemas is next on the roadmap; the package finds the repository by walking
up from its own location or from `COOKWALA_ROOT`.

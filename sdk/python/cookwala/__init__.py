"""Cookwala Python package (0.2.0).

Thin, honest wrapper around the reference library in tools/cookwala_ref.py and the data in this
repository (vocabularies, schemas, profiles, conformance vectors). Install from the repository:

    pip install -e sdk/python            # library + `cookwala` command (standard library only)
    pip install -e "sdk/python[full]"    # adds schema validation, signatures, API checks

A standalone wheel on PyPI is "next" on the roadmap; until then the package needs the repository
checkout (set COOKWALA_ROOT if you install it elsewhere).
"""
import importlib.util
import os
import pathlib
import sys

__version__ = '0.2.0'


def _find_root():
    env = os.environ.get('COOKWALA_ROOT')
    if env:
        return pathlib.Path(env)
    here = pathlib.Path(__file__).resolve()
    for p in [here, *here.parents]:
        if (p / 'vocab' / 'ops.json').exists() and (p / 'tools' / 'cookwala_ref.py').exists():
            return p
    raise ImportError('Cookwala repository not found. Install with `pip install -e sdk/python` from a checkout, or set COOKWALA_ROOT.')


ROOT = _find_root()
_spec = importlib.util.spec_from_file_location('cookwala_ref', ROOT / 'tools' / 'cookwala_ref.py')
ref = importlib.util.module_from_spec(_spec)
sys.modules['cookwala_ref'] = ref
_spec.loader.exec_module(ref)

# Public API (same names as the reference library)
canonical = ref.canonical
doc_hash = ref.doc_hash
sign = ref.sign
verify = ref.verify
verify_chain = ref.verify_chain
verify_checkpoint = ref.verify_checkpoint
disclosure_digest = ref.disclosure_digest
verify_disclosure = ref.verify_disclosure
convert = ref.convert
check_envelope = ref.check_envelope
ladder_choice = ref.ladder_choice
dry_run = ref.dry_run
execution_transition_allowed = ref.execution_transition_allowed
mission_transition_allowed = ref.mission_transition_allowed
replay_mission = ref.replay_mission
derive_constraints = ref.derive_constraints
registry_name_valid = ref.registry_name_valid
version_exact = ref.version_exact
check_signal = ref.check_signal
parse_sms = ref.parse_sms

__all__ = ['ROOT', 'ref', 'canonical', 'doc_hash', 'sign', 'verify', 'verify_chain', 'verify_checkpoint', 'disclosure_digest', 'verify_disclosure', 'convert', 'check_envelope', 'ladder_choice', 'dry_run',
           'execution_transition_allowed', 'mission_transition_allowed', 'replay_mission', 'derive_constraints', 'registry_name_valid', 'version_exact', 'check_signal', 'parse_sms']

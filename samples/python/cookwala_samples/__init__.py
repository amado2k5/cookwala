"""Cookwala samples: clients, agents, orchestrators, gates, recovery and reporting.

Runnable sample code for the Cookwala Core 0.2 API, standard library only. Everything runs offline
against a simulated executor (the data comes from the bundled snapshot of this repository), or
against a real hub (`python hub/cookwala_hub.py`, or any executor that serves the Core API).

    from cookwala_samples import demo
    print(demo().to_markdown())

These are samples, not certified software. The executor is always the authority: the gates in
this package check early so a client can explain a refusal, and the executor checks again.
"""
__version__ = '0.2.0'

from .errors import CookwalaProblem  # noqa: E402
from .jcs import canonical, doc_hash  # noqa: E402
from .data import load_bundle  # noqa: E402
from .simulator import SimulatedExecutor, dry_run  # noqa: E402
from .clients import HubClient, LocalClient, BundleCatalog, HubCatalog  # noqa: E402
from .gates import GateContext, GatePipeline  # noqa: E402
from .agents import PlannerAgent, MonitorAgent, ScriptedHuman, make_mandate  # noqa: E402
from .recovery import RecoveryPolicy, RecoveryAction  # noqa: E402
from .orchestrators import Orchestrator, Job  # noqa: E402
from .reporting import Reporter, RunRecord, incident_from  # noqa: E402
from .scenarios import demo  # noqa: E402

__all__ = ['__version__', 'CookwalaProblem', 'canonical', 'doc_hash', 'load_bundle', 'SimulatedExecutor', 'dry_run',
           'HubClient', 'LocalClient', 'BundleCatalog', 'HubCatalog', 'GateContext', 'GatePipeline',
           'PlannerAgent', 'MonitorAgent', 'ScriptedHuman', 'make_mandate', 'RecoveryPolicy', 'RecoveryAction',
           'Orchestrator', 'Job', 'Reporter', 'RunRecord', 'incident_from', 'demo']

# Kitchen agent-safety benchmark (draft 0.1)

Ten test cases, written for [promptfoo](https://www.promptfoo.dev), check whether an AI agent
acting for a household follows the Cookwala Core agent rules (docs/CORE.md section 6):
untrusted text, mandates and caps, allergen blocks, safety limits, unattended operations,
data sharing, recalls and expiry. One benign case checks the agent doesn't over-refuse.

```bash
npx promptfoo@latest eval -c evals/kitchen-agent-safety/promptfooconfig.yaml
npx promptfoo@latest view
```

Add providers in `promptfooconfig.yaml` to compare models. When you publish results,
include the model id, the date, and the commit of this folder. The benchmark measures agent
behaviour in text; devices still enforce safety limits on their own. A passing agent is
defence in depth, not a replacement for those limits.

Contributions welcome: new attack patterns, more cuisines and languages, multi-turn cases.

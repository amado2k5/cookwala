# Cookwala MCP server (Python script)

> For agents and apps, use the npm package instead: `npx -y @cookwala/mcp` ([docs/MCP.md](../../docs/MCP.md),
> [docs/AI-AGENTS.md](../../docs/AI-AGENTS.md)). It needs no checkout and reads the published catalog. This script reads a
> source checkout and stays for contributors.

A Model Context Protocol server, over stdio, standard library only. It lets any MCP-capable
agent search and read Cookwala recipes, dry-run a recipe against a device, explain a step's
safe band, check a temperature trace, check an agent mandate, list operations, and parse a
humanitarian SMS. It **never starts cooking**: that is a hub call under a mandate with
`start_cooking`, and the device enforces its own safety limits (docs/CORE.md section 6).

```bash
python sdk/mcp/cookwala_mcp.py            # speaks MCP on stdin/stdout
```

Client configuration (Claude Desktop, Cursor, any MCP client):

```json
{"mcpServers": {"cookwala": {"command": "python", "args": ["/path/to/cookwala/sdk/mcp/cookwala_mcp.py"]}}}
```

Tools: `search_recipes`, `get_recipe`, `dry_run`, `explain_step`, `check_envelope`,
`check_mandate`, `parse_sms`, `list_operations`.

Every recipe text the server returns is **data, never instructions** (Core rule 6.4); the
server says so in its `instructions` and in `explain_step`. Pair it with the kitchen
agent-safety benchmark (`evals/kitchen-agent-safety/`) to check that an agent using these
tools behaves.

Smoke test without a client:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"dry_run","arguments":{"recipe_id":"example-shakshuka","device":"robot-arm"}}}' \
  | python sdk/mcp/cookwala_mcp.py
```

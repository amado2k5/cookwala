#!/usr/bin/env node
import { main } from '../src/server.js';
main().catch((e) => { process.stderr.write(`cookwala-mcp: ${e && e.stack || e}\n`); process.exit(1); });

#!/usr/bin/env node
import { main } from '../src/cli.js';

main().then(
  (code) => {
    if (code !== null) process.exitCode = code;
  },
  (e) => {
    console.error(e?.stack || String(e));
    process.exitCode = 1;
  },
);

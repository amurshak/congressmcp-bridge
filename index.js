#!/usr/bin/env node

console.error(`
========================================
  CongressMCP has moved!
========================================

This NPM package is deprecated.
The server now runs locally via Python.

Install the new version:
  uvx congressmcp

Or with pip:
  pip install congressmcp

Setup guide:
  https://github.com/amurshak/congressMCP
========================================
`);

process.exit(1);

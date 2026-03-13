# congressmcp (DEPRECATED)

**This NPM package is no longer maintained.** CongressMCP v2.0.0 runs locally as a Python MCP server — no bridge, no API key, no hosted server needed.

## Migration

1. Uninstall: `npm uninstall -g congressmcp`
2. Install the new local server: `uvx congressmcp` (requires Python 3.10+ and [uv](https://docs.astral.sh/uv/))
3. Get a free Congress.gov API key at [api.congress.gov/sign-up](https://api.congress.gov/sign-up/)
4. See the setup guide: [github.com/amurshak/congressMCP](https://github.com/amurshak/congressMCP)

## What Changed

CongressMCP was converted from a hosted SaaS service to a free, open-source, local-first MCP server. The NPM bridge that connected Claude Desktop to the hosted backend is no longer needed — the server now runs locally via stdio.

## License

MIT

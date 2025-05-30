# Congressional MCP

Connect Claude Desktop to US Congressional data - bills, amendments, members, committees, and more.

## Installation

```bash
npm install -g congressional-mcp
```

The server will be automatically configured in Claude Desktop. Restart Claude to activate.

## Usage

Ask Claude about:
- Bills: "Search for recent climate bills"
- Members: "Who represents California in the Senate?"
- Committees: "What committees handle healthcare?"
- Amendments: "Show amendments to HR 1234"

## Manual Setup

If auto-install fails, add this to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "congressional-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "congressional-mcp"
      ],
      "env": {}
    }
  }
}
```

## Support

alex@lawgiver.ai
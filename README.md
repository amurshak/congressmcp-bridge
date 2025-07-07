# congressmcp

Connect Claude Desktop to US Congressional data - bills, amendments, members, committees, and more.

## Quick Start (5 minutes)

### Installation

```bash
npm install -g congressmcp
```

### Setup

1. **Get your API key:**
   - Visit: https://congressmcp.lawgiver.ai
   - Sign up for a free account  
   - Check your email for your API key

2. **Configure local MCP client:**

Add this to your config or cline_mcp_settings.json with your API key:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "congressmcp": {
      "command": "npx",
      "args": [
        "-y", 
        "congressmcp"
      ],
      "env": {
        "CONGRESSMCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

3. **Restart Claude Desktop** to activate the connection.

## Usage

Ask Claude about:
- Bills: "Search for recent climate bills"
- Members: "Who represents California in the Senate?"  
- Committees: "What committees handle healthcare?"
- Amendments: "Show amendments to HR 1234"
- Roll Call Votes: "How did senators vote on the infrastructure bill?"
- And much more legislative data!

## Alternative Installation: Self-Hosted

For advanced users who want full control, CongressMCP is open source:
- Clone the [CongressMCP repository](https://github.com/amurshak/congressMCP)
- Requires Python environment + database setup
- Congress.gov API key needed
- See CongressMCP/README.md for technical details

**Note:** Self-hosting requires significant technical setup and maintenance. The hosted service (above) provides better reliability and support for most users.

## Subscription Tiers

- **FREE**: All functions with 500 calls/month
- **PRO**: $19/month, all functions with 5,000 calls/month
- **ENTERPRISE**: Custom pricing, unlimited usage

## Support

support@congressmcp.lawgiver.ai
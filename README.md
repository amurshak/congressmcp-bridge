# Congressional MCP

Connect Claude Desktop to US Congressional data - bills, amendments, members, committees, and more.

## Installation

```bash
npm install -g congressmcp
```

## Setup

1. **Get your API key:**
   - Visit: https://congressmcp.lawgiver.ai
   - Sign up for a free account  
   - Check your email for your API key

2. **Configure Claude Desktop:**

Add this to your Claude Desktop config with your API key:

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

## Subscription Tiers

- **FREE**: 200 API calls/month, basic tools
- **PRO**: $29/month, 5,000 calls, all tools
- **ENTERPRISE**: Custom pricing, unlimited usage

## Support

alex@lawgiver.ai
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
- Roll Call Votes: "How did senators vote on the infrastructure bill?"
- And much more legislative data!

## Known Limitations

⚠️ **Important Architectural Notice:**

Currently, all users share a single Congress.gov API key on the backend server. This means:

- **Rate Limits**: All users share the same 5,000 requests/hour quota from Congress.gov
- **Scalability**: May hit rate limits with many concurrent users
- **Architecture**: Not the ideal long-term solution

**Planned Fix (v2.0):** Future versions will require users to provide their own Congress.gov API key for individual rate limits and better scalability. This will require:
1. Obtaining a free Congress.gov API key at: https://api.congress.gov/sign-up/
2. Adding `CONGRESS_GOV_API_KEY` to your Claude config

**Current Status:** This limitation doesn't affect functionality for early users, but please be aware that heavy usage may experience rate limiting.

## Subscription Tiers

- **FREE**: 200 API calls/month, basic tools
- **PRO**: $29/month, 5,000 calls, all tools
- **ENTERPRISE**: Custom pricing, unlimited usage

## Support

alex@lawgiver.ai
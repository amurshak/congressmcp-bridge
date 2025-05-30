#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

function getConfigPath() {
  const home = os.homedir();
  switch (os.platform()) {
    case 'darwin': return path.join(home, 'Library/Application Support/Claude/claude_desktop_config.json');
    case 'win32': return path.join(home, 'AppData/Roaming/Claude/claude_desktop_config.json');
    default: return path.join(home, '.config/Claude/claude_desktop_config.json');
  }
}

async function install() {
  const configPath = getConfigPath();
  await fs.ensureDir(path.dirname(configPath));
  
  let config = {};
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath).catch(() => ({}));
  }
  
  if (!config.mcpServers) config.mcpServers = {};
  
  // Always update/overwrite the congressional-mcp entry
  config.mcpServers['congressional-mcp'] = {
    command: 'npx',
    args: [
      '-y',
      'congressional-mcp'
    ],
    env: {}
  };
  
  await fs.writeJson(configPath, config, { spaces: 2 });
  console.log('Congressional MCP configured. Restart Claude Desktop.');
}

install().catch(console.error);
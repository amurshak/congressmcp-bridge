#!/usr/bin/env node

/**
 * Congressional MCP Bridge - Connects Claude Desktop to Congressional MCP Server
 * Handles authentication and request forwarding
 */

const https = require('https');
const os = require('os');
const path = require('path');
const fs = require('fs');

const SERVER_BASE = 'https://congressmcp.lawgiver.ai';
let sessionId = null;
let isInitialized = false;

// Get API key from environment variable (set by Claude Desktop)
const API_KEY = process.env.CONGRESSMCP_API_KEY;

if (!API_KEY) {
  console.error('🚫 ERROR: CONGRESSMCP_API_KEY environment variable not set\n');
  console.error('📋 SETUP INSTRUCTIONS:');
  console.error('1. Get your API key at: https://congressmcp.lawgiver.ai');
  console.error('2. Add to Claude Desktop config:');
  console.error('   {');
  console.error('     "mcpServers": {');
  console.error('       "congressmcp": {');
  console.error('         "command": "npx",');
  console.error('         "args": ["-y", "congressmcp"],');
  console.error('         "env": {');
  console.error('           "CONGRESSMCP_API_KEY": "your-api-key-here"');
  console.error('         }');
  console.error('       }');
  console.error('     }');
  console.error('   }');
  console.error('3. Restart Claude Desktop\n');
  console.error('📧 Need help? Email: support@congressmcp.lawgiver.ai');
  process.exit(1);
}

// Simple in-memory session store for the bridge process
class SessionManager {
  constructor() {
    this.sessionId = null;
    this.isInitialized = false;
  }

  async ensureInitialized() {
    if (this.isInitialized && this.sessionId) {
      return;
    }
    
    console.error(`DEBUG: Initializing new MCP session with authentication...`);
    
    // Step 1: Send initialize
    const initMessage = {
      jsonrpc: "2.0",
      id: Date.now(), // Use timestamp as unique ID
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          roots: { listChanged: true },
          sampling: {}
        },
        clientInfo: {
          name: "congressmcp-bridge",
          version: "1.1.0"
        }
      }
    };
    
    const initResponse = await this.makeRequest(initMessage, false);
    
    if (initResponse && initResponse.result) {
      // Step 2: Send initialized notification
      const notificationMessage = {
        jsonrpc: "2.0",
        method: "notifications/initialized"
      };
      
      await this.makeRequest(notificationMessage, true);
      this.isInitialized = true;
      console.error(`DEBUG: MCP session fully initialized with ID: ${this.sessionId}`);
    } else {
      throw new Error(`Initialize failed: ${JSON.stringify(initResponse)}`);
    }
  }

  makeRequest(message, useSession = true) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(message);
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'congressmcp-bridge/1.1.0',
        'Authorization': `Bearer ${API_KEY}`
      };
      
      if (useSession && this.sessionId) {
        headers['MCP-Session-ID'] = this.sessionId;
      }
      
      console.error(`DEBUG: Authenticated request to /mcp/`);
      
      const req = https.request(`${SERVER_BASE}/mcp/`, {
        method: 'POST',
        headers: headers,
        timeout: 30000
      }, (res) => {
        // Extract or update session ID
        if (res.headers['mcp-session-id']) {
          this.sessionId = res.headers['mcp-session-id'];
        }
        
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          console.error(`DEBUG: Response status: ${res.statusCode}`);
          console.error(`DEBUG: Response length: ${responseData.length} chars`);
          
          if (res.statusCode !== 200 && res.statusCode !== 202) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
            return;
          }
          
          // Handle SSE format
          if (res.headers['content-type']?.includes('text/event-stream')) {
            const lines = responseData.split('\n');
            let jsonData = null;
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.substring(6).trim();
                if (data && data !== '[DONE]' && data !== '') {
                  try {
                    jsonData = JSON.parse(data);
                    console.error(`DEBUG: Parsed response data successfully`);
                    break;
                  } catch (e) {
                    console.error(`DEBUG: Failed to parse: "${data}"`);
                  }
                }
              }
            }
            
            if (jsonData) {
              resolve(jsonData);
            } else {
              // For notifications, empty response is OK (HTTP 202)
              if (message.method && message.method.startsWith('notifications/')) {
                console.error(`DEBUG: Empty response for notification (HTTP ${res.statusCode} - expected)`);
                resolve(null);
              } else if (res.statusCode === 202) {
                console.error(`DEBUG: HTTP 202 response - operation accepted`);
                resolve(null);
              } else {
                console.error(`DEBUG: No JSON found in SSE response`);
                console.error(`DEBUG: Full response: "${responseData}"`);
                reject(new Error(`No valid JSON data in response`));
              }
            }
          } else {
            // Regular JSON response
            if (responseData.trim() === '') {
              // Empty response - check if this is expected
              if (message.method && message.method.startsWith('notifications/')) {
                console.error(`DEBUG: Empty response for notification (expected)`);
                resolve(null);
              } else if (res.statusCode === 202) {
                console.error(`DEBUG: HTTP 202 with empty body (accepted)`);
                resolve(null);
              } else {
                reject(new Error(`Unexpected empty response`));
              }
            } else {
              try {
                const jsonResponse = JSON.parse(responseData);
                resolve(jsonResponse);
              } catch (e) {
                reject(new Error(`Invalid JSON: ${responseData}`));
              }
            }
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.write(data);
      req.end();
    });
  }

  async sendMessage(message) {
    try {
      // Special handling for initialize
      if (message.method === 'initialize') {
        this.sessionId = null;
        this.isInitialized = false;
        await this.ensureInitialized();
        
        // Return a successful initialize response
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              experimental: {},
              prompts: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              tools: { listChanged: false }
            },
            serverInfo: {
              name: "Congress MCP",
              version: "1.9.2"
            }
          }
        };
      }
      
      // For other requests, ensure we're initialized
      await this.ensureInitialized();
      
      // Send the actual request
      return await this.makeRequest(message, true);
      
    } catch (error) {
      console.error(`DEBUG: sendMessage error: ${error.message}`);
      return {
        jsonrpc: "2.0",
        id: message.id !== undefined ? message.id : null,
        error: { 
          code: -32603, 
          message: error.message 
        }
      };
    }
  }
}

// Create global session manager
const sessionManager = new SessionManager();

// Process multiple stdin inputs without reinitializing
let inputBuffer = '';

// Main stdio handler
async function main() {
  console.error(`DEBUG: Congressional MCP Bridge with persistent sessions starting`);
  
  process.stdin.on('data', async (data) => {
    inputBuffer += data.toString();
    
    // Process complete lines
    let lines = inputBuffer.split('\n');
    inputBuffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const message = JSON.parse(line.trim());
        console.error(`DEBUG: Processing: ${message.method || 'notification'} (ID: ${message.id})`);
        
        const response = await sessionManager.sendMessage(message);
        
        if (response !== undefined && response !== null) {
          console.log(JSON.stringify(response));
        }
      } catch (error) {
        console.error(`DEBUG: Parse error: ${error.message}`);
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { 
            code: -32700, 
            message: `Parse error: ${error.message}` 
          }
        }));
      }
    }
  });

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  process.on('SIGINT', () => {
    console.error('DEBUG: Bridge shutting down');
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    console.error('DEBUG: Bridge shutting down');
    process.exit(0);
  });
}

main().catch(error => {
  console.error(`Bridge failed to start: ${error.message}`);
  process.exit(1);
});
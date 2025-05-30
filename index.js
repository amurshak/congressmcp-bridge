#!/usr/bin/env node

/**
 * Congressional MCP Bridge
 * Converts stdio MCP protocol to your custom HTTP/SSE format
 */

const http = require('https');
const { URL } = require('url');

const SERVER_BASE = 'https://congressmcp.lawgiver.ai';
let sessionId = null;
let messageEndpoint = null;

// Step 1: Connect to SSE endpoint to get session info
function connectToSSE() {
  return new Promise((resolve, reject) => {
    const req = http.request(`${SERVER_BASE}/sse/`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      res.on('data', (chunk) => {
        const data = chunk.toString();
        const lines = data.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const endpoint = line.substring(6).trim();
            if (endpoint.includes('/sse/messages/')) {
              const url = new URL(endpoint, SERVER_BASE);
              sessionId = url.searchParams.get('session_id');
              messageEndpoint = endpoint;
              resolve();
              return;
            }
          }
        }
      });

      res.on('error', reject);
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 2: Send MCP messages to the message endpoint
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(message);
    const url = `${SERVER_BASE}${messageEndpoint}`;
    
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          resolve({ result: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Main stdio <-> HTTP bridge
async function main() {
  try {
    await connectToSSE();
    
    // Handle stdin input (from Claude Desktop)
    process.stdin.on('data', async (data) => {
      try {
        const message = JSON.parse(data.toString().trim());
        const response = await sendMessage(message);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -1, message: error.message }
        }));
      }
    });

    process.stdin.resume();
    
  } catch (error) {
    console.error(`Failed to connect: ${error.message}`);
    process.exit(1);
  }
}

main();
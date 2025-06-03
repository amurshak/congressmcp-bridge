#!/usr/bin/env node

/**
 * Quick test script to validate NPM bridge connection to Congressional MCP backend
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔍 Testing Congressional MCP NPM Bridge Connection...\n');

// Test with the index.js as if it were installed as a package
const testCommand = `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | node index.js`;

console.log('📡 Sending initialize request to FastMCP backend...');
console.log('⏱️  Timeout: 15 seconds\n');

const startTime = Date.now();

exec(testCommand, { timeout: 15000 }, (error, stdout, stderr) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms\n`);
    
    if (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ETIMEDOUT') {
            console.error('🔥 TIMEOUT: FastMCP backend is still hanging (this was the original issue)');
        }
        return;
    }
    
    if (stderr) {
        console.error('⚠️  Stderr:', stderr);
    }
    
    if (stdout) {
        console.log('✅ Response received:');
        console.log(stdout);
        
        try {
            const response = JSON.parse(stdout.trim());
            if (response.jsonrpc === "2.0") {
                if (response.error && response.error.code === -32002) {
                    console.log('\n🎉 SUCCESS: FastMCP session initialization is working!');
                    console.log('   - Received proper JSON-RPC error (expected for invalid API key)');
                    console.log('   - No timeout issues');
                    console.log('   - Ready for production use with valid API keys');
                } else if (response.result) {
                    console.log('\n🎉 PERFECT: Session initialized successfully!');
                } else {
                    console.log('\n⚠️  Unexpected response format');
                }
            }
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError.message);
        }
    } else {
        console.log('⚠️  No stdout output received');
    }
});

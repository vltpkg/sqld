#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function testBinary(platform) {
  const binaryPath = path.join(__dirname, '..', 'packages', platform, 'sqld');
  
  if (!fs.existsSync(binaryPath)) {
    console.log(`❌ Binary not found for ${platform}: ${binaryPath}`);
    return false;
  }
  
  try {
    // Test if binary is executable and shows help
    const result = execSync(`${binaryPath} --help`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    if (result.includes('sqld') || result.includes('libsql')) {
      console.log(`✅ ${platform} binary works correctly`);
      return true;
    } else {
      console.log(`❌ ${platform} binary output unexpected: ${result.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${platform} binary failed to execute: ${error.message}`);
    return false;
  }
}

function testMainPackage() {
  try {
    const { getPlatformPackage } = require('../lib/index.js');
    const platformPackage = getPlatformPackage();
    console.log(`✅ Platform detection works: ${platformPackage}`);
    return true;
  } catch (error) {
    console.log(`❌ Platform detection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing sqld binaries...\n');
  
  const platforms = ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64'];
  let allPassed = true;
  
  // Test each platform binary
  for (const platform of platforms) {
    if (!testBinary(platform)) {
      allPassed = false;
    }
  }
  
  // Test main package
  if (!testMainPackage()) {
    allPassed = false;
  }
  
  console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'));
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
} 
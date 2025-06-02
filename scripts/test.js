#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function testBinary(platform) {
  const binaryPath = path.join(__dirname, '..', 'packages', platform, 'sqld');
  
  if (!fs.existsSync(binaryPath)) {
    console.log(`❌ Binary not found for ${platform}: ${binaryPath}`);
    return false;
  }
  
  // Check if this binary can run on the current platform
  const currentPlatform = os.platform();
  const currentArch = os.arch();
  const [targetOS, targetArch] = platform.split('-');
  
  // Only test binaries that can run on the current system
  if (targetOS !== currentPlatform) {
    console.log(`⏭️  Skipping ${platform} binary (wrong OS: ${currentPlatform} vs ${targetOS})`);
    return true; // Don't count as failure
  }
  
  if ((targetArch === 'arm64' && currentArch !== 'arm64') || 
      (targetArch === 'x64' && !['x64', 'x86_64'].includes(currentArch))) {
    console.log(`⏭️  Skipping ${platform} binary (wrong arch: ${currentArch} vs ${targetArch})`);
    return true; // Don't count as failure
  }
  
  try {
    // Test if binary is executable and shows help
    const result = execSync(`${binaryPath} --help`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    if (result.includes('sqld') || result.includes('libsql') || result.includes('SQL daemon')) {
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

function testPackageStructure() {
  console.log('📦 Testing package structure...');
  
  const platforms = ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64'];
  let allValid = true;
  
  for (const platform of platforms) {
    const packagePath = path.join(__dirname, '..', 'packages', platform, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log(`❌ Package.json missing for ${platform}`);
      allValid = false;
      continue;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check required fields
      if (!packageJson.bin || !packageJson.bin.sqld) {
        console.log(`❌ ${platform} missing bin.sqld field`);
        allValid = false;
        continue;
      }
      
      if (packageJson.bin.sqld !== 'sqld') {
        console.log(`❌ ${platform} bin.sqld should point to 'sqld', got '${packageJson.bin.sqld}'`);
        allValid = false;
        continue;
      }
      
      console.log(`✅ ${platform} package structure is valid`);
    } catch (error) {
      console.log(`❌ ${platform} package.json is invalid: ${error.message}`);
      allValid = false;
    }
  }
  
  return allValid;
}

async function main() {
  console.log('🧪 Testing sqld binaries...\n');
  
  const platforms = ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64'];
  let allPassed = true;
  
  // Test package structure
  if (!testPackageStructure()) {
    allPassed = false;
  }
  
  console.log(''); // Empty line
  
  // Test each platform binary
  for (const platform of platforms) {
    if (!testBinary(platform)) {
      allPassed = false;
    }
  }
  
  console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'));
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
} 
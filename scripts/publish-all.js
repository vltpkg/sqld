#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const PLATFORMS = ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64'];

function publishPackage(packagePath, packageName) {
  try {
    console.log(`📦 Publishing ${packageName}...`);
    execSync('npm publish --access public', { 
      cwd: packagePath, 
      stdio: 'inherit' 
    });
    console.log(`✅ Successfully published ${packageName}`);
  } catch (error) {
    console.error(`❌ Failed to publish ${packageName}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    // First publish all platform-specific packages
    for (const platform of PLATFORMS) {
      const packagePath = path.join(__dirname, '..', 'packages', platform);
      const packageName = `@sqld/${platform}`;
      publishPackage(packagePath, packageName);
    }
    
    // Then publish the main package
    const rootPath = path.join(__dirname, '..');
    publishPackage(rootPath, 'sqld');
    
    console.log('\n🎉 All packages published successfully!');
  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 
#!/usr/bin/env node

const { execSync } = require('child_process');

async function main() {
  try {
    console.log('🔍 Checking for new version...');
    execSync('node scripts/check-version.js', { stdio: 'inherit' });
    
    console.log('\n📦 Extracting binaries...');
    execSync('node scripts/extract-binaries.js', { stdio: 'inherit' });
    
    console.log('\n✅ Build completed successfully!');
  } catch (error) {
    if (error.status === 1 && error.stdout && error.stdout.includes('Already up to date')) {
      console.log('✅ Already up to date, no build needed');
      process.exit(0);
    }
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 
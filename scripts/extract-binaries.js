#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getLatestDockerTag } = require('./check-version.js');

const PLATFORMS = [
  { name: 'darwin-arm64', dockerPlatform: 'linux/arm64' },
  { name: 'darwin-x64', dockerPlatform: 'linux/amd64' },
  { name: 'linux-arm64', dockerPlatform: 'linux/arm64' },
  { name: 'linux-x64', dockerPlatform: 'linux/amd64' }
];

async function extractBinary(platform, version) {
  const { name, dockerPlatform } = platform;
  const packageDir = path.join(__dirname, '..', 'packages', name);
  const binaryPath = path.join(packageDir, 'sqld');
  
  console.log(`Extracting binary for ${name}...`);
  
  try {
    // Pull the specific platform image
    const imageTag = `ghcr.io/tursodatabase/libsql-server:${version}`;
    console.log(`Pulling ${imageTag} for ${dockerPlatform}...`);
    execSync(`docker pull --platform ${dockerPlatform} ${imageTag}`, { stdio: 'inherit' });
    
    // Create a temporary container
    const containerId = execSync(`docker create --platform ${dockerPlatform} ${imageTag}`, { encoding: 'utf8' }).trim();
    
    try {
      // Copy the binary from the container
      const tempBinaryPath = path.join(__dirname, '..', 'temp-sqld');
      execSync(`docker cp ${containerId}:/bin/sqld ${tempBinaryPath}`);
      
      // Move to the correct package directory
      if (fs.existsSync(binaryPath)) {
        fs.unlinkSync(binaryPath);
      }
      fs.renameSync(tempBinaryPath, binaryPath);
      
      // Make executable
      fs.chmodSync(binaryPath, 0o755);
      
      console.log(`✓ Extracted binary for ${name}`);
    } finally {
      // Clean up container
      execSync(`docker rm ${containerId}`, { stdio: 'pipe' });
    }
  } catch (error) {
    console.error(`✗ Failed to extract binary for ${name}:`, error.message);
    throw error;
  }
}

async function updatePackageVersions(version) {
  console.log(`Updating package versions to ${version}...`);
  
  // Update root package.json
  const rootPackagePath = path.join(__dirname, '..', 'package.json');
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  rootPackage.version = version;
  
  // Update optional dependencies versions
  for (const platform of PLATFORMS) {
    rootPackage.optionalDependencies[`@sqld/${platform.name}`] = version;
  }
  
  fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
  
  // Update platform package versions
  for (const platform of PLATFORMS) {
    const packagePath = path.join(__dirname, '..', 'packages', platform.name, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  }
  
  console.log('✓ Updated all package versions');
}

async function main() {
  try {
    const version = await getLatestDockerTag();
    console.log(`Extracting binaries for version ${version}...`);
    
    // Extract binaries for all platforms
    for (const platform of PLATFORMS) {
      await extractBinary(platform, version);
    }
    
    // Update package versions
    await updatePackageVersions(version);
    
    console.log('✓ All binaries extracted and versions updated successfully!');
  } catch (error) {
    console.error('Error extracting binaries:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 
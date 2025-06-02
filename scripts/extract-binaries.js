#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { getLatestDockerTag } = require('./check-version.js');

const PLATFORMS = [
  { 
    name: 'darwin-arm64', 
    artifact: 'libsql-server-aarch64-apple-darwin.tar.xz'
  },
  { 
    name: 'darwin-x64', 
    artifact: 'libsql-server-x86_64-apple-darwin.tar.xz'
  },
  { 
    name: 'linux-arm64', 
    artifact: 'libsql-server-aarch64-unknown-linux-gnu.tar.xz'
  },
  { 
    name: 'linux-x64', 
    artifact: 'libsql-server-x86_64-unknown-linux-gnu.tar.xz'
  }
];

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function extractBinary(platform, version) {
  const { name, artifact } = platform;
  const packageDir = path.join(__dirname, '..', 'packages', name);
  const binaryPath = path.join(packageDir, 'sqld');
  
  console.log(`Extracting binary for ${name}...`);
  
  try {
    // Download URL for the release artifact
    const downloadUrl = `https://github.com/tursodatabase/libsql/releases/download/${version}/${artifact}`;
    const tempDir = path.join(__dirname, '..', 'temp');
    const tempArtifactPath = path.join(tempDir, artifact);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log(`  Downloading ${downloadUrl}...`);
    await downloadFile(downloadUrl, tempArtifactPath);
    
    // Extract the tarball
    console.log(`  Extracting ${artifact}...`);
    execSync(`tar -xf "${tempArtifactPath}" -C "${tempDir}"`, { stdio: 'pipe' });
    
    // Find the sqld binary in the extracted files
    // The binary should be in a directory named after the version
    const extractedDir = path.join(tempDir, artifact.replace('.tar.xz', ''));
    let sqldSourcePath;
    
    // Try different possible locations for the binary
    const possiblePaths = [
      path.join(extractedDir, 'sqld'),
      path.join(extractedDir, 'bin', 'sqld'),
      path.join(extractedDir, 'libsql-server', 'sqld'),
      path.join(tempDir, 'sqld')
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        sqldSourcePath = possiblePath;
        break;
      }
    }
    
    // If not found in expected locations, search recursively
    if (!sqldSourcePath) {
      const findCommand = `find "${tempDir}" -name "sqld" -type f`;
      try {
        const result = execSync(findCommand, { encoding: 'utf8' });
        const foundPaths = result.trim().split('\n').filter(p => p);
        if (foundPaths.length > 0) {
          sqldSourcePath = foundPaths[0];
        }
      } catch (error) {
        // find command failed
      }
    }
    
    if (!sqldSourcePath || !fs.existsSync(sqldSourcePath)) {
      throw new Error(`Could not find sqld binary in extracted archive for ${name}`);
    }
    
    // Copy the binary to the package directory
    if (fs.existsSync(binaryPath)) {
      fs.unlinkSync(binaryPath);
    }
    fs.copyFileSync(sqldSourcePath, binaryPath);
    
    // Make executable
    fs.chmodSync(binaryPath, 0o755);
    
    console.log(`✓ Extracted binary for ${name}`);
    
    // Clean up temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Could not clean up temp directory: ${error.message}`);
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
    if (rootPackage.optionalDependencies) {
      rootPackage.optionalDependencies[`@sqld/${platform.name}`] = version;
    }
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
const { execFileSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const os = require('os');

// Platform mapping
const PLATFORM_MAP = {
  'darwin': {
    'arm64': '@sqld/darwin-arm64',
    'x64': '@sqld/darwin-x64'
  },
  'linux': {
    'arm64': '@sqld/linux-arm64',
    'x64': '@sqld/linux-x64'
  }
};

function getPlatformPackage() {
  const platform = os.platform();
  const arch = os.arch();
  
  if (!PLATFORM_MAP[platform] || !PLATFORM_MAP[platform][arch]) {
    throw new Error(`Unsupported platform: ${platform}-${arch}`);
  }
  
  return PLATFORM_MAP[platform][arch];
}

function getBinaryPath() {
  const packageName = getPlatformPackage();
  const packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
  const binaryPath = path.join(packagePath, 'sqld');
  
  if (!existsSync(binaryPath)) {
    throw new Error(`Binary not found at ${binaryPath}. Make sure ${packageName} is installed.`);
  }
  
  return binaryPath;
}

function execSync(args = [], options = {}) {
  const binaryPath = getBinaryPath();
  return execFileSync(binaryPath, args, options);
}

function exec(args = [], options = {}) {
  const binaryPath = getBinaryPath();
  return spawn(binaryPath, args, options);
}

module.exports = {
  execSync,
  exec,
  getBinaryPath,
  getPlatformPackage
}; 
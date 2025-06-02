#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');

async function getLatestDockerTag() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/tursodatabase/libsql/releases/latest',
      headers: {
        'User-Agent': 'sqld-npm-publisher'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          resolve(release.tag_name);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getCurrentNpmVersion() {
  try {
    const result = execSync('npm view sqld@latest version', { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    // Package doesn't exist yet
    return '0.0.0';
  }
}

async function main() {
  try {
    const latestTag = await getLatestDockerTag();
    const currentVersion = await getCurrentNpmVersion();
    
    console.log(`Latest libsql-server release: ${latestTag}`);
    console.log(`Current npm version: ${currentVersion}`);
    
    if (latestTag !== currentVersion) {
      console.log('New version available!');
      process.exit(0); // Success - new version found
    } else {
      console.log('Already up to date');
      process.exit(1); // No update needed
    }
  } catch (error) {
    console.error('Error checking version:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getLatestDockerTag, getCurrentNpmVersion }; 
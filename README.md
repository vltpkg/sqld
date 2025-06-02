# `sqld`

A package wrapper for [libsql-server](https://github.com/tursodatabase/libsql) (`sqld`) with platform-specific binaries.

This package automatically downloads and publishes the latest `libsql-server` releases from the official Docker container, making them available as npm packages with platform-specific binaries.

## Installation

```bash
vlt install sqld
```

The appropriate platform-specific binary will be automatically installed based on your system:

- `@sqld/darwin-arm64` - macOS ARM64 (Apple Silicon)
- `@sqld/darwin-x64` - macOS x64 (Intel)
- `@sqld/linux-arm64` - Linux ARM64
- `@sqld/linux-x64` - Linux x64

### Windows Support

Windows is not directly supported as `libsql-server` does not provide native Windows binaries. However, you can use `sqld` on Windows through **Windows Subsystem for Linux (WSL)**:

1. **Install WSL**: Follow the [official WSL installation guide](https://docs.microsoft.com/en-us/windows/wsl/install)
2. **Choose a Linux distribution**: Ubuntu, Debian, or any other supported distribution
3. **Install Node.js** in your WSL environment
4. **Install sqld** within WSL: `vlt install sqld`

The Linux ARM64 or x64 binary (depending on your system architecture) will be used within the WSL environment.

## Usage

### Command Line

After installation, you can use `sqld` directly from the command line:

```bash
# Start sqld server
vlx sqld --help

# Example: Start with a database file
vlx sqld --db-path ./my-database.db
```

### Programmatic API

```javascript
const sqld = require('sqld');

// Execute sqld synchronously
try {
  const result = sqld.execSync(['--help']);
  console.log(result.toString());
} catch (error) {
  console.error('Error:', error.message);
}

// Execute sqld asynchronously
const child = sqld.exec(['--db-path', './my-database.db']);

child.stdout.on('data', (data) => {
  console.log('stdout:', data.toString());
});

child.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

child.on('exit', (code) => {
  console.log('Process exited with code:', code);
});

// Get the binary path
const binaryPath = sqld.getBinaryPath();
console.log('Binary located at:', binaryPath);

// Get the platform package name
const platformPackage = sqld.getPlatformPackage();
console.log('Using platform package:', platformPackage);
```

## How It Works

This project uses a multi-package approach:

1. **Main Package (`sqld`)**: Contains the Node.js wrapper and CLI interface
2. **Platform Packages**: Contains the actual binaries for each platform:
   - `@sqld/darwin-arm64`
   - `@sqld/darwin-x64`
   - `@sqld/linux-arm64`
   - `@sqld/linux-x64`

The main package declares the platform packages as optional dependencies. When you install `sqld`, your package manager will only install the package that matches your current platform.

## Automated Updates

This project automatically checks for new `libsql-server` releases daily using GitHub Actions:

1. **Daily Check**: Runs at 9 AM UTC to check for new releases
2. **Binary Extraction**: Downloads the Docker container and extracts platform-specific binaries
3. **Testing**: Verifies that all binaries work correctly
4. **Publishing**: Automatically publishes new versions to `npmjs.com`
5. **Git Commit**: Commits the updated binaries to the repository

## Development

### Prerequisites

- Node.js 18+
- `vlt` (`npm i -g vlt`)

### Scripts

```bash
# Check for new versions
vlr check-version

# Extract binaries from Docker containers
vlr extract-binaries

# Build everything (check + extract)
vlr build

# Test all binaries
clr test

# Publish all packages to npm
vlr publish-all
```

### Manual Testing

You can test the build process manually:

```bash
# Install dependencies
vlt install

# Extract the latest binaries
vlr extract-binaries

# Test that everything works
vlr test

# Test the CLI
./bin/sqld --help
```

### GitHub Actions

Two workflows are included:

1. **`auto-publish.yml`**: Runs daily and on pushes to main, automatically publishes new versions
2. **`test.yml`**: Manual testing workflow that builds but doesn't publish

To set up automated publishing, add these secrets to your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token with publish permissions

## Project Structure

```
sqld/
├── package.json              # Main package configuration
├── lib/index.js              # Node.js API
├── bin/sqld                  # CLI wrapper
├── scripts/
│   ├── check-version.js      # Check for new releases
│   ├── extract-binaries.js   # Extract binaries from Docker
│   ├── build.js              # Build orchestration
│   ├── publish-all.js        # Publish all packages
│   └── test.js               # Test all binaries
├── packages/
│   ├── darwin-arm64/         # macOS ARM64 package
│   ├── darwin-x64/           # macOS x64 package
│   ├── linux-arm64/          # Linux ARM64 package
│   └── linux-x64/            # Linux x64 package
└── .github/workflows/        # GitHub Actions
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Projects

- [libsql](https://github.com/tursodatabase/libsql) - The original libSQL project
- [Turso](https://turso.tech/) - Managed libSQL service
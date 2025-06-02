# `sqld`

A package wrapper for [libsql-server](https://github.com/tursodatabase/libsql) (`sqld`) with platform-specific binaries.

This package automatically downloads and publishes the latest `libsql-server` releases from the [official GitHub releases](https://github.com/tursodatabase/libsql/releases?q=libsql-server-), making them available as npm packages with platform-specific binaries.

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

## How It Works

This project uses a simple platform-specific binary distribution approach:

1. **Platform Detection**: The package manager automatically installs only the compatible platform package based on your OS and architecture
2. **Direct Binary Access**: Each platform package directly provides the `sqld` binary through its `bin` field
3. **No Wrapper**: No JavaScript wrapper or bootstrap code - the platform packages directly expose the native `sqld` binary

### Automated Updates

The project automatically checks for new `libsql-server` releases daily using GitHub Actions:

1. **Daily Check**: Runs at 9 AM UTC to check for new releases from the [libsql GitHub repository](https://github.com/tursodatabase/libsql/releases?q=libsql-server-)
2. **Binary Extraction**: Downloads platform-specific tarballs and extracts the `sqld` binaries
3. **Testing**: Verifies that all binaries work correctly
4. **Publishing**: Automatically publishes new versions to npm
5. **Git Commit**: Commits the updated binaries to the repository

The project uses the following release artifacts for each platform:
- **macOS ARM64**: `libsql-server-aarch64-apple-darwin.tar.xz`
- **macOS x64**: `libsql-server-x86_64-apple-darwin.tar.xz`
- **Linux ARM64**: `libsql-server-aarch64-unknown-linux-gnu.tar.xz`
- **Linux x64**: `libsql-server-x86_64-unknown-linux-gnu.tar.xz`

## Development

### Prerequisites

- Node.js 18+
- `tar` command (available on macOS/Linux by default)
- npm account with publishing permissions

### Scripts

```bash
# Check for new versions
npm run check-version

# Extract binaries from GitHub releases
npm run extract-binaries

# Build everything (check + extract)
npm run build

# Test all binaries
npm run test

# Publish all packages to npm
npm run publish-all
```

### GitHub Actions

Two workflows are included:

1. **`auto-publish.yml`**: Runs daily and on pushes to main, automatically publishes new versions
2. **`test.yml`**: Manual testing workflow that builds but doesn't publish

To set up automated publishing, add these secrets to your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token with publish permissions

## License

MIT

## Related Projects

- [libsql](https://github.com/tursodatabase/libsql) - The original libSQL project
- [Turso](https://turso.tech/) - Managed libSQL service
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

## License

MIT

## Related Projects

- [libsql](https://github.com/tursodatabase/libsql) - The original libSQL project
- [Turso](https://turso.tech/) - Managed libSQL service
# Contributing

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
```

### Manually Versioning

Set the versions across all packages & update the root's dependency specs

```bash
$ v=<version> npm run release
```

### Manually Publishing

Setting a `--tag` may not be desired depending on if its a prerelease

```bash
$ npm publish --force --ws --iwr --tag latest --access public
```

### GitHub Actions

Two workflows are included:

1. **`auto-publish.yml`**: Runs daily and on pushes to main, automatically publishes new versions
2. **`test.yml`**: Manual testing workflow that builds but doesn't publish

To set up automated publishing, add these secrets to your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token with publish permissions
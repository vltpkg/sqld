# Contributing

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
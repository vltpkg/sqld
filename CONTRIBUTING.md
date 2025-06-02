# Contributing

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
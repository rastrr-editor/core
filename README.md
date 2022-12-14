# Rastrr editor core

## Install

1. Create file `.npmrc` in the root of the project with given contents:
   ```
   @rastrr:registry=https://npm.pkg.github.com
   ```
2. Run `npm install @rastrr/core`
3. Add to your \*.d.ts file:
   ```ts
   /// <reference types="@rastrr/core/global" />
   ```

## Development

### Quick Start

- `npm i`

### NPM Scripts

- `npm run serve` - run server for example on localhost:4200
- `npm run watch` - run watcher for example
- `npm run dev` - build example in directory 'example'
- `npm run format` - format code using prettier
- `npm run format:check` - check formatting errors
- `npm run lint` - lint code

### Publish to github npm registry

1. Login: `npm login --scope=@rastrr --registry=https://npm.pkg.github.com`. You need to use [specific access token](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries).
2. Execute the command: `npm publish`

### Upgrade package version

1. Execute the command: `npm version patch|minor|major -m "Version description"`

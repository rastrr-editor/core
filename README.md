# Rastrr editor core

Core of the [rastrr editor client](https://github.com/rastrr-editor/client)

## Install

1. Create file `.npmrc` in the root of the project with given contents:
   ```
   @rastrr-editor:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=<PERSONAL ACCESS TOKEN WITH read:packages SCOPE>
   ```
2. Run `npm install @rastrr-editor/core`
3. Add to your \*.d.ts file:
   ```ts
   /// <reference types="@rastrr-editor/core/global" />
   ```

## Architecture

**Main classes**

![Main classes](https://rastrr.ru/github/core-classes.png)

**Interfaces**

![Interfaces](https://rastrr.ru/github/core-interfaces.png)

**Base commands**

![Base commands](https://rastrr.ru/github/core-commands.png)

## Development

### Quick Start

1. `npm i`
2. `npm run serve`

### NPM Scripts

- `npm run serve` - run server for example on localhost:4200
- `npm run watch` - run watcher for example
- `npm run dev` - build example in directory 'example'
- `npm run format` - format code using prettier
- `npm run format:check` - check formatting errors
- `npm run lint` - lint code

### Debug

1. Open browser console
2. Execute code: `localStorage.debug = '@rastrr-editor/core*'`

### Publish to github npm registry

1. Login: `npm login --scope=@rastrr-editor --registry=https://npm.pkg.github.com`. You need to use [specific access token](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries).
2. Execute the command: `npm publish`

### Upgrade package version

1. Execute the command: `npm version patch|minor|major -m "Version description"`

### Development with realtime integration

Sometimes you need to test package integration and make some changes in realtime.

1. Create link to the package `npm link`
2. Run command `npm build:watch`
3. Go to the project and add package via link `npm link @rastrr-editor/core`

P.s. if you are using vite, it must be run with force flag, i.e.: `npx vite --force`.

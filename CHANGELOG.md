# Changelog

All notable changes to nLabs NPM Manager are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-24

First release.

### Added

- Three-column panel: workspace projects, package list, package details
- Search against the npm registry, with the installed state shown inline
- Installed tab, grouped by `dependencies` / `devDependencies` / `peerDependencies`
- Updates tab with a badge count, and a separate colour for major-version jumps
- Package details: description, license, homepage, repository, keywords,
  weekly downloads and the package's own dependency list
- Version selector covering every published version
- Install into `devDependencies` with a dedicated action
- npm / yarn / pnpm support, detected from the lock file or pinned in settings
- Every `package.json` in the workspace is listed and switchable
- Resizable columns
- Turkish, English, German and French, following the VS Code locale

### Safety behaviour

- Major-version updates ask for confirmation before running. Upgrading a single
  package of a family on its own (for example one Angular package from 21 to 22)
  produces a project that will not build.
- Updating a `devDependency` keeps it in `devDependencies` instead of moving it
  into `dependencies`.
- Whether an operation succeeded is read from `package.json`, not from the exit
  code: pnpm can return a non-zero code after a successful install
  (`ERR_PNPM_IGNORED_BUILDS`).
- Package names and versions are validated against a whitelist before reaching
  the command line, and only `http`/`https` URLs from registry metadata are
  opened.
- Package manager output stays in the `nLabs NPM` output channel; notifications
  carry a short summary instead of the raw error dump.

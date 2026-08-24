# nLabs NPM Manager

A Visual Studio-style npm package manager for Node.js projects inside VS Code.

Search, install, update and remove packages across every project in your
workspace, without leaving the editor and without memorising CLI flags.

## Features

- **3-column layout** — Projects | Package List | Details
- **Search** — Query the npm registry with sorting options
- **Installed tab** — Every package declared in the selected `package.json`,
  grouped by `dependencies` / `devDependencies` / `peerDependencies`
- **Updates tab** — Packages with a newer version, with a badge count
- **Package details** — Description, license, homepage, repository, keywords,
  weekly downloads and the package's own dependency list
- **Version selector** — Pick any published version; latest is pre-selected
- **Dev dependencies** — Install straight into `devDependencies`
- **npm / yarn / pnpm** — Detected from the lock file, or pinned in settings
- **Multi-project workspace** — Every `package.json` in the workspace is listed
- **Resizable columns** — Drag the gutters to adjust panel widths
- **4 languages** — Turkish, English, German, French (follows the VS Code locale)

## Safety

Package managers are destructive tools, so the extension is deliberately
careful in three places:

- **Major version jumps require confirmation.** Upgrading one package of a
  family on its own (say, a single Angular package from 21 to 22) leaves a
  project that will not build. Those updates are marked in a different colour
  and ask before running.
- **The dependency section is preserved.** Updating a `devDependency` keeps it
  in `devDependencies` instead of silently moving it to `dependencies`.
- **Success is read from `package.json`, not the exit code.** pnpm can return a
  non-zero code after a perfectly successful install; the extension checks what
  actually changed on disk before reporting.

## Requirements

- [Node.js](https://nodejs.org) installed and available on `PATH`
- npm, yarn or pnpm on `PATH`
- A `package.json` somewhere in your workspace

## Usage

**Open the manager:**
- Right-click a folder or a `package.json` in the Explorer -> **nLabs: NPM Manager**
- Command Palette (`Ctrl+Shift+P`) -> **nLabs: NPM Manager**
- Click the package icon in the editor title bar while a `package.json` is open

**Install a package:**
1. Search for a package name
2. Click the result to see its details
3. Pick a version from the dropdown
4. Click **Yukle** (Install) — or **Dev Yukle** (Install Dev) for a devDependency

**Update a package:**
1. Open the **Guncellemeler** (Updates) tab
2. Click the package; the latest version is pre-selected
3. Click **Guncelle** (Update) — a major version jump will ask for confirmation

**Remove a package:**
1. Open the **Yuklu** (Installed) tab
2. Click the package
3. Click **Kaldir** (Remove)

When a command fails, the notification stays short and the full output of the
package manager is written to the **nLabs NPM** output channel.

## Settings

| Setting | Default | Description |
|---|---|---|
| `nlabsNpm.language` | `auto` | Display language: `auto`, `tr`, `en`, `de`, `fr` |
| `nlabsNpm.packageManager` | `auto` | `auto` (detect from lock file), `npm`, `yarn`, `pnpm` |

## Extension Commands

| Command | Description |
|---|---|
| `nLabs: NPM Manager` | Open the NPM Manager panel |

## Development

```bash
npm install
npm run compile      # tsc -p ./
npm test             # 34 unit tests, node:test, no test dependencies
npm run package      # build the .vsix
```

Press `F5` to launch an Extension Development Host. It opens `test-fixtures/`
as its workspace, which contains five projects covering npm / yarn / pnpm lock
files, awkward version ranges and an empty project. The manual checklist lives
in [test-fixtures/README.md](test-fixtures/README.md).

## License

MIT — see [LICENSE](LICENSE).

export function getWebviewContent(cspSource: string, scriptUri: string): string {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${cspSource}; style-src 'unsafe-inline'; img-src ${cspSource} https: data:;">
<title>nLabs NPM Manager</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); background: var(--vscode-editor-background); }
.app { display: flex; height: 100vh; overflow: hidden; }
.gutter { width: 4px; flex-shrink: 0; cursor: col-resize; background: var(--vscode-panel-border); transition: background .15s; }
.gutter:hover, .gutter.dragging { background: var(--vscode-focusBorder); }

/* Left */
.col-projects { width: 180px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--vscode-sideBar-background, var(--vscode-editor-background)); }
.sidebar-title { padding: 10px 10px 6px; font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--vscode-sideBarTitle-foreground, var(--vscode-descriptionForeground)); flex-shrink: 0; border-bottom: 1px solid var(--vscode-panel-border); }
.project-list { flex: 1; overflow-y: auto; }
.project-item { padding: 6px 10px 6px 12px; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 2px solid transparent; user-select: none; }
.project-item:hover { background: var(--vscode-list-hoverBackground); }
.project-item.active { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); border-left-color: var(--vscode-focusBorder); font-weight: 600; }
.project-sub { font-size: 10px; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Middle */
.col-packages { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 160px; }
.search-row { display: flex; gap: 6px; align-items: center; padding: 7px 8px; border-bottom: 1px solid var(--vscode-panel-border); flex-shrink: 0; }
.search-row input[type=text] { flex: 1; padding: 4px 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 2px; outline: none; font-size: 12px; }
.search-row input[type=text]:focus { border-color: var(--vscode-focusBorder); }
.sort-row { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-bottom: 1px solid var(--vscode-panel-border); flex-shrink: 0; }
.sort-label { font-size: 11px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
#sortSelect { flex: 1; padding: 2px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 2px; font-size: 11px; }
.tabs { display: flex; flex-shrink: 0; border-bottom: 1px solid var(--vscode-panel-border); background: var(--vscode-editorGroupHeader-tabsBackground, var(--vscode-editor-background)); }
.tab { padding: 7px 16px; cursor: pointer; font-size: 12px; color: var(--vscode-tab-inactiveForeground, var(--vscode-descriptionForeground)); border-bottom: 2px solid transparent; user-select: none; }
.tab:hover { color: var(--vscode-foreground); }
.tab.active { color: var(--vscode-tab-activeForeground, var(--vscode-foreground)); border-bottom-color: var(--vscode-tab-activeBorderTop, var(--vscode-focusBorder)); }
#updateCount:not(:empty) { background: #2d7d46; color: #fff; border-radius: 8px; padding: 0 5px; font-size: 10px; margin-left: 3px; }
.pkg-list { flex: 1; overflow-y: auto; }
.pkg-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; cursor: pointer; border-bottom: 1px solid var(--vscode-panel-border); }
.pkg-item:hover { background: var(--vscode-list-hoverBackground); }
.pkg-item.selected { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
.pkg-item.selected .pkg-desc, .pkg-item.selected .pkg-meta { color: var(--vscode-list-activeSelectionForeground); opacity: .75; }
.pkg-icon-sm { width: 32px; height: 32px; flex-shrink: 0; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: #cc3534; color: #fff; font-size: 11px; font-weight: 800; margin-top: 1px; }
.pkg-body { flex: 1; min-width: 0; }
.pkg-name-row { display: flex; align-items: center; gap: 6px; }
.pkg-name { font-weight: 600; font-size: 12px; }
.pkg-author { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 1px; }
.pkg-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pkg-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; padding-top: 1px; }
.pkg-ver { font-size: 11px; color: var(--vscode-descriptionForeground); }
.badge { font-size: 10px; border-radius: 2px; padding: 1px 5px; font-weight: 600; }
.badge-installed { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
.badge-dev { background: #1e5799; color: #fff; }
.badge-update { background: #2d7d46; color: #fff; }
/* Ana surum atlamasi: yesil "guvenle guncelle" sinyali vermemeli. */
.badge-major { background: #a35b00; color: #fff; cursor: help; }

/* Right */
.col-details { width: 310px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--vscode-editor-background); min-width: 180px; }
.detail-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--vscode-descriptionForeground); font-size: 12px; padding: 20px; text-align: center; }
.detail-empty-icon { font-size: 32px; opacity: .3; }
.detail-header { padding: 12px 14px 10px; border-bottom: 1px solid var(--vscode-panel-border); flex-shrink: 0; }
.detail-top { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
.detail-icon-lg { width: 48px; height: 48px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #cc3534; color: #fff; font-size: 16px; font-weight: 800; flex-shrink: 0; }
.detail-title-wrap { flex: 1; min-width: 0; }
.detail-name { font-size: 14px; font-weight: 700; }
.detail-author { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
.detail-dl { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 1px; }
.detail-action-area { display: flex; flex-direction: column; gap: 6px; }
.version-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.version-label { color: var(--vscode-descriptionForeground); flex-shrink: 0; width: 80px; }
.version-value { font-weight: 600; }
.version-new { color: #4caf50; font-weight: 600; }
.btn-row { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.btn-primary { flex: 1; padding: 5px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer; font-size: 12px; font-weight: 600; }
.btn-primary:hover { background: var(--vscode-button-hoverBackground); }
.btn-primary:disabled { opacity: .5; cursor: default; }
.btn-secondary { padding: 5px 12px; background: var(--vscode-button-secondaryBackground, transparent); color: var(--vscode-button-secondaryForeground, var(--vscode-foreground)); border: 1px solid var(--vscode-panel-border); border-radius: 2px; cursor: pointer; font-size: 12px; }
.btn-secondary:hover { background: var(--vscode-list-hoverBackground); }
.btn-danger { padding: 5px 12px; background: transparent; color: var(--vscode-errorForeground); border: 1px solid var(--vscode-errorForeground); border-radius: 2px; cursor: pointer; font-size: 12px; }
.btn-danger:hover { background: var(--vscode-errorForeground); color: #fff; }
select { padding: 3px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 2px; font-size: 12px; }
.detail-body { flex: 1; overflow-y: auto; padding: 12px 14px; }
.detail-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--vscode-descriptionForeground); margin: 12px 0 6px; padding-bottom: 4px; border-bottom: 1px solid var(--vscode-panel-border); }
.detail-section-title:first-child { margin-top: 0; }
.detail-desc { font-size: 12px; line-height: 1.6; }
.detail-meta-row { display: flex; gap: 6px; font-size: 11px; margin-bottom: 4px; align-items: flex-start; }
.detail-meta-label { color: var(--vscode-descriptionForeground); flex-shrink: 0; }
.detail-meta-val { word-break: break-all; }
.link { color: var(--vscode-textLink-foreground); cursor: pointer; text-decoration: underline; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.tag { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-radius: 3px; padding: 1px 6px; font-size: 10px; }
.dep-entry { font-size: 11px; padding: 2px 0; display: flex; justify-content: space-between; }
.dep-range { color: var(--vscode-descriptionForeground); font-size: 10px; }
.no-deps { font-size: 11px; color: var(--vscode-descriptionForeground); font-style: italic; }
.loading { padding: 20px; text-align: center; color: var(--vscode-descriptionForeground); font-size: 12px; }
.empty { padding: 20px; text-align: center; color: var(--vscode-descriptionForeground); font-size: 12px; }
.about-panel { padding: 20px; overflow-y: auto; flex: 1; }
.about-logo { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
.about-sub { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 16px; }
.about-section { margin-bottom: 16px; }
.about-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 4px; }
.about-feature { font-size: 12px; padding: 3px 0; display: flex; gap: 8px; }
.about-feature::before { content: "✓"; color: var(--vscode-terminal-ansiGreen); flex-shrink: 0; }
.about-meta { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 3px; }
</style>
</head>
<body>
<div class="app">

  <!-- Left: Projects -->
  <div class="col-projects" id="colProjects">
    <div class="sidebar-title">Projeler</div>
    <div class="project-list" id="projectList"><div class="loading">...</div></div>
  </div>

  <div class="gutter" id="gutter1"></div>

  <!-- Middle: Packages -->
  <div class="col-packages" id="colPackages">
    <div class="search-row">
      <input id="searchInput" type="text" placeholder="Paket ara..." />
    </div>
    <div class="sort-row">
      <span class="sort-label">Sırala:</span>
      <select id="sortSelect">
        <option value="optimal">Popülerlik</option>
        <option value="quality">Kalite</option>
        <option value="maintenance">Bakım</option>
      </select>
    </div>
    <div class="tabs">
      <div class="tab active" data-tab="browse"><span data-i18n-tab="0">Ara</span></div>
      <div class="tab" data-tab="installed"><span data-i18n-tab="1">Yüklü</span></div>
      <div class="tab" data-tab="updates"><span data-i18n-tab="2">Güncellemeler</span> <span id="updateCount"></span></div>
      <div class="tab" data-tab="about"><span data-i18n-tab="3">Hakkında</span></div>
    </div>
    <div class="pkg-list" id="pkgList">
      <div class="empty">Paket aramak için yukarıdaki alanı kullanın.</div>
    </div>
  </div>

  <div class="gutter" id="gutter2"></div>

  <!-- Right: Details -->
  <div class="col-details" id="colDetails">
    <div class="detail-empty">
      <div class="detail-empty-icon">&#128230;</div>
      <div>Detay görmek için bir paket seçin</div>
    </div>
  </div>

</div>
<script src="${scriptUri}"></script>
</body>
</html>`;
}

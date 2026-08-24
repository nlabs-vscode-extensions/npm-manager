(function () {
  var vscode = acquireVsCodeApi();

  // ── i18n ──
  var LANGS = {
    tr: {
      sidebar: 'Projeler', noProjects: 'Proje yok',
      searchPlaceholder: 'Paket ara...',
      sortLabel: 'Sırala:', sortOpts: ['Popülerlik', 'Kalite', 'Bakım'],
      tabs: ['Ara', 'Yüklü', 'Güncellemeler', 'Hakkında'],
      loading: 'Yükleniyor...', searchHint: 'Paket aramak için yukarıdaki alanı kullanın.',
      noInstalled: 'Yüklü paket yok.', allUpToDate: 'Tüm paketler güncel ✓',
      selectHint: 'Detay görmek için bir paket seçin',
      dInstalled: 'Yüklü:', dLatest: 'Güncel:', dVersion: 'Versiyon:',
      install: 'Yükle', installDev: 'Dev Yükle', update: 'Güncelle', remove: 'Kaldır',
      installing: 'Yükleniyor...', updating: 'Güncelleniyor...', removing: 'Kaldırılıyor...',
      detailLoading: 'Detaylar yükleniyor...',
      description: 'Açıklama', info: 'Bilgiler', license: 'Lisans:', homepage: 'Ana sayfa:',
      repo: 'Kaynak:', deps: 'Bağımlılıklar', devDeps: 'Dev Bağımlılıklar',
      peerDeps: 'Peer Bağımlılıklar', noDeps: 'Bağımlılık yok', downloads: 'indirme/hafta',
      aboutFeatures: 'Özellikler', aboutInfo: 'Bilgi', aboutSettings: 'Ayarlar', aboutLang: 'Dil',
      langAuto: 'Otomatik (VS Code)', depType: 'Bağımlılık türü:',
      installedBadge: 'yüklü',
      majorWarning: 'Ana sürüm atlaması — kırılma değişikliği içerebilir',
      features: ['NPM paket arama', 'Paket yükleme (dependencies & devDependencies)', 'Güncelleme bildirimleri', 'Paket detayları (lisans, bağımlılıklar, keywords)', 'npm / yarn / pnpm otomatik algılama', 'Tüm workspace projelerini listeler', 'Pre-release paket desteği']
    },
    en: {
      sidebar: 'Projects', noProjects: 'No projects',
      searchPlaceholder: 'Search packages...',
      sortLabel: 'Sort:', sortOpts: ['Popularity', 'Quality', 'Maintenance'],
      tabs: ['Browse', 'Installed', 'Updates', 'About'],
      loading: 'Loading...', searchHint: 'Use the search field above to find packages.',
      noInstalled: 'No installed packages.', allUpToDate: 'All packages up to date ✓',
      selectHint: 'Select a package to see details',
      dInstalled: 'Installed:', dLatest: 'Latest:', dVersion: 'Version:',
      install: 'Install', installDev: 'Install Dev', update: 'Update', remove: 'Remove',
      installing: 'Installing...', updating: 'Updating...', removing: 'Removing...',
      detailLoading: 'Loading details...',
      description: 'Description', info: 'Info', license: 'License:', homepage: 'Homepage:',
      repo: 'Repository:', deps: 'Dependencies', devDeps: 'Dev Dependencies',
      peerDeps: 'Peer Dependencies', noDeps: 'No dependencies', downloads: 'downloads/week',
      aboutFeatures: 'Features', aboutInfo: 'Info', aboutSettings: 'Settings', aboutLang: 'Language',
      langAuto: 'Auto-detect (VS Code)', depType: 'Dependency type:',
      installedBadge: 'installed',
      majorWarning: 'Major version jump — may contain breaking changes',
      features: ['NPM package search', 'Install packages (dependencies & devDependencies)', 'Update notifications', 'Package details (license, dependencies, keywords)', 'npm / yarn / pnpm auto-detection', 'Lists all workspace projects', 'Pre-release package support']
    },
    de: {
      sidebar: 'Projekte', noProjects: 'Keine Projekte',
      searchPlaceholder: 'Pakete suchen...',
      sortLabel: 'Sortieren:', sortOpts: ['Popularität', 'Qualität', 'Wartung'],
      tabs: ['Suchen', 'Installiert', 'Updates', 'Info'],
      loading: 'Laden...', searchHint: 'Verwenden Sie das Suchfeld oben, um Pakete zu finden.',
      noInstalled: 'Keine installierten Pakete.', allUpToDate: 'Alle Pakete sind aktuell ✓',
      selectHint: 'Wählen Sie ein Paket aus, um Details anzuzeigen',
      dInstalled: 'Installiert:', dLatest: 'Aktuell:', dVersion: 'Version:',
      install: 'Installieren', installDev: 'Dev installieren', update: 'Aktualisieren', remove: 'Entfernen',
      installing: 'Installiere...', updating: 'Aktualisiere...', removing: 'Entferne...',
      detailLoading: 'Lade Details...',
      description: 'Beschreibung', info: 'Informationen', license: 'Lizenz:', homepage: 'Homepage:',
      repo: 'Repository:', deps: 'Abhängigkeiten', devDeps: 'Dev-Abhängigkeiten',
      peerDeps: 'Peer-Abhängigkeiten', noDeps: 'Keine Abhängigkeiten', downloads: 'Downloads/Woche',
      aboutFeatures: 'Funktionen', aboutInfo: 'Informationen', aboutSettings: 'Einstellungen', aboutLang: 'Sprache',
      langAuto: 'Automatisch (VS Code)', depType: 'Abhängigkeitstyp:',
      installedBadge: 'installiert',
      majorWarning: 'Hauptversionssprung — kann Breaking Changes enthalten',
      features: ['NPM-Paketsuche', 'Pakete installieren (dependencies & devDependencies)', 'Update-Benachrichtigungen', 'Paketdetails (Lizenz, Abhängigkeiten, Keywords)', 'npm / yarn / pnpm automatische Erkennung', 'Listet alle Workspace-Projekte auf', 'Vorabversion-Unterstützung']
    },
    fr: {
      sidebar: 'Projets', noProjects: 'Aucun projet',
      searchPlaceholder: 'Rechercher des paquets...',
      sortLabel: 'Trier:', sortOpts: ['Popularité', 'Qualité', 'Maintenance'],
      tabs: ['Parcourir', 'Installés', 'Mises à jour', 'À propos'],
      loading: 'Chargement...', searchHint: 'Utilisez le champ de recherche pour trouver des paquets.',
      noInstalled: 'Aucun paquet installé.', allUpToDate: 'Tous les paquets sont à jour ✓',
      selectHint: 'Sélectionnez un paquet pour voir les détails',
      dInstalled: 'Installé:', dLatest: 'Dernier:', dVersion: 'Version:',
      install: 'Installer', installDev: 'Installer Dev', update: 'Mettre à jour', remove: 'Supprimer',
      installing: 'Installation...', updating: 'Mise à jour...', removing: 'Suppression...',
      detailLoading: 'Chargement des détails...',
      description: 'Description', info: 'Informations', license: 'Licence:', homepage: 'Page d\'accueil:',
      repo: 'Dépôt:', deps: 'Dépendances', devDeps: 'Dépendances Dev',
      peerDeps: 'Dépendances Peer', noDeps: 'Aucune dépendance', downloads: 'téléchargements/semaine',
      aboutFeatures: 'Fonctionnalités', aboutInfo: 'Informations', aboutSettings: 'Paramètres', aboutLang: 'Langue',
      langAuto: 'Détection automatique (VS Code)', depType: 'Type de dépendance:',
      installedBadge: 'installé',
      majorWarning: 'Saut de version majeure — peut contenir des changements incompatibles',
      features: ['Recherche de paquets NPM', 'Installer des paquets (dependencies & devDependencies)', 'Notifications de mise à jour', 'Détails du paquet (licence, dépendances, keywords)', 'Détection automatique npm / yarn / pnpm', 'Liste tous les projets du workspace', 'Support des pré-versions']
    }
  };

  function L() { return LANGS[state.lang] || LANGS.en; }

  function applyStaticTranslations() {
    var l = L();
    document.querySelector('.sidebar-title').textContent = l.sidebar;
    document.getElementById('searchInput').placeholder = l.searchPlaceholder;
    document.querySelector('.sort-label').textContent = l.sortLabel;
    var sortOpts = document.querySelectorAll('#sortSelect option');
    l.sortOpts.forEach(function (txt, i) { if (sortOpts[i]) { sortOpts[i].textContent = txt; } });
    document.querySelectorAll('[data-i18n-tab]').forEach(function (el) {
      var i = parseInt(el.getAttribute('data-i18n-tab'));
      el.textContent = l.tabs[i];
    });
  }

  // ── State ──
  var state = {
    projects: [], currentProjectPath: null,
    installedPackages: [], searchPackages: [],
    currentTab: 'browse', selectedPkg: null,
    updateMap: {}, majorMap: {}, lang: 'en', langSetting: 'auto'
  };

  // ── Tabs ──
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      state.currentTab = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderPackageList();
    });
  });

  // ── Search ──
  document.getElementById('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { doSearch(); }
  });
  document.getElementById('sortSelect').addEventListener('change', doSearch);

  function doSearch() {
    var q = document.getElementById('searchInput').value.trim();
    state.currentTab = 'browse';
    document.querySelectorAll('.tab').forEach(function (t, i) { t.classList.toggle('active', i === 0); });
    document.getElementById('pkgList').innerHTML = '<div class="loading">' + esc(L().loading) + '</div>';
    vscode.postMessage({ command: 'search', query: q, sortBy: document.getElementById('sortSelect').value });
  }

  // ── Project list ──
  document.getElementById('projectList').addEventListener('click', function (e) {
    var item = e.target.closest('.project-item');
    if (!item) { return; }
    var p = item.getAttribute('data-path');
    if (p === state.currentProjectPath) { return; }
    state.currentProjectPath = p;
    state.installedPackages = [];
    state.updateMap = {};
    state.majorMap = {};
    state.selectedPkg = null;
    renderProjectList();
    renderDetails(null);
    document.getElementById('pkgList').innerHTML = '<div class="loading">' + esc(L().loading) + '</div>';
    vscode.postMessage({ command: 'switchProject', path: p });
  });

  // ── Package list click ──
  document.getElementById('pkgList').addEventListener('click', function (e) {
    var item = e.target.closest('.pkg-item');
    if (!item) { return; }
    document.querySelectorAll('.pkg-item').forEach(function (i) { i.classList.remove('selected'); });
    item.classList.add('selected');
    var name = item.getAttribute('data-name');
    var version = item.getAttribute('data-version');
    var pkg = findPkg(name) || { name: name, version: version, description: '', author: '', keywords: [], weeklyDownloads: 0, links: {} };
    state.selectedPkg = pkg;
    renderDetails(pkg, null);
    vscode.postMessage({ command: 'getDetails', name: name });
    if (!pkg.versions || !pkg.versions.length) {
      vscode.postMessage({ command: 'getVersions', name: name });
    }
  });

  // ── Render: projects ──
  function renderProjectList() {
    var l = L();
    if (!state.projects.length) {
      document.getElementById('projectList').innerHTML = '<div class="empty">' + esc(l.noProjects) + '</div>';
      return;
    }
    document.getElementById('projectList').innerHTML = state.projects.map(function (p) {
      var active = p.path === state.currentProjectPath ? ' active' : '';
      return '<div class="project-item' + active + '" data-path="' + esc(p.path) + '" title="' + esc(p.path) + '">' +
        esc(p.label) +
        '<div class="project-sub">' + esc(p.relative) + '</div>' +
      '</div>';
    }).join('');
  }

  // ── Render: package list ──
  function renderPackageList() {
    if (state.currentTab === 'browse') { renderBrowseList(); }
    else if (state.currentTab === 'updates') { renderUpdatesList(); }
    else if (state.currentTab === 'about') { renderAbout(); }
    else { renderInstalledList(); }
  }

  // Ana surum atlamasi farkli renkte: "guncelleme var" ile "bu seni kirar" ayni sey degil.
  function updateBadge(name, latest) {
    if (!latest) { return ''; }
    var major = state.majorMap[name.toLowerCase()];
    var cls = major ? 'badge badge-major' : 'badge badge-update';
    var title = major ? ' title="' + esc(L().majorWarning) + '"' : '';
    return '<span class="' + cls + '"' + title + '>&#8593; ' + esc(latest) + (major ? ' !' : '') + '</span>';
  }

  function npmIcon(name) {
    var initials = (name || '?').replace(/^@[^/]+\//, '').slice(0, 2).toUpperCase();
    var colors = ['#cc3534','#1976d2','#388e3c','#f57c00','#7b1fa2','#0097a7','#5d4037'];
    var color = colors[name.charCodeAt(0) % colors.length];
    return '<div class="pkg-icon-sm" style="background:' + color + '">' + esc(initials) + '</div>';
  }

  function renderBrowseList() {
    var l = L();
    if (!state.searchPackages.length) {
      document.getElementById('pkgList').innerHTML = '<div class="empty">' + esc(l.searchHint) + '</div>';
      return;
    }
    var instMap = {};
    state.installedPackages.forEach(function (p) { instMap[p.name.toLowerCase()] = p; });
    document.getElementById('pkgList').innerHTML = state.searchPackages.map(function (p) {
      var inst = instMap[p.name.toLowerCase()];
      var badge = inst ? '<span class="badge ' + (inst.type === 'devDependencies' ? 'badge-dev' : 'badge-installed') + '">' + esc(inst.type === 'devDependencies' ? 'dev' : l.installedBadge) + '</span>' : '';
      var latest = state.updateMap[p.name.toLowerCase()];
      var updBadge = updateBadge(p.name, latest);
      return '<div class="pkg-item" data-name="' + esc(p.name) + '" data-version="' + esc(p.version) + '">' +
        npmIcon(p.name) +
        '<div class="pkg-body">' +
          '<div class="pkg-name-row"><span class="pkg-name">' + esc(p.name) + '</span>' + badge + updBadge + '</div>' +
          '<div class="pkg-author">' + esc(p.author) + '</div>' +
          '<div class="pkg-desc">' + esc((p.description || '').slice(0, 80)) + '</div>' +
        '</div>' +
        '<div class="pkg-right"><span class="pkg-ver">' + esc(p.version) + '</span></div>' +
      '</div>';
    }).join('');
  }

  function renderInstalledList() {
    var l = L();
    if (!state.installedPackages.length) {
      document.getElementById('pkgList').innerHTML = '<div class="empty">' + esc(l.noInstalled) + '</div>';
      return;
    }
    document.getElementById('pkgList').innerHTML = state.installedPackages.map(function (p) {
      var latest = state.updateMap[p.name.toLowerCase()];
      var badgeHtml = updateBadge(p.name, latest);
      var typeBadge = p.type === 'devDependencies' ? '<span class="badge badge-dev">dev</span>' : (p.type === 'peerDependencies' ? '<span class="badge badge-installed">peer</span>' : '');
      return '<div class="pkg-item" data-name="' + esc(p.name) + '" data-version="' + esc(p.version) + '">' +
        npmIcon(p.name) +
        '<div class="pkg-body">' +
          '<div class="pkg-name-row"><span class="pkg-name">' + esc(p.name) + '</span>' + typeBadge + '</div>' +
          '<div class="pkg-author">' + esc(p.version) + '</div>' +
        '</div>' +
        '<div class="pkg-right">' + badgeHtml + '</div>' +
      '</div>';
    }).join('');
  }

  function renderUpdatesList() {
    var l = L();
    var updatable = state.installedPackages.filter(function (p) { return !!state.updateMap[p.name.toLowerCase()]; });
    if (!updatable.length) {
      document.getElementById('pkgList').innerHTML = '<div class="empty">' + esc(l.allUpToDate) + '</div>';
      return;
    }
    document.getElementById('pkgList').innerHTML = updatable.map(function (p) {
      var latest = state.updateMap[p.name.toLowerCase()];
      return '<div class="pkg-item" data-name="' + esc(p.name) + '" data-version="' + esc(p.version) + '">' +
        npmIcon(p.name) +
        '<div class="pkg-body">' +
          '<div class="pkg-name-row"><span class="pkg-name">' + esc(p.name) + '</span></div>' +
          '<div class="pkg-author">' + esc(p.version) + ' → <strong>' + esc(latest) + '</strong></div>' +
        '</div>' +
        '<div class="pkg-right">' + updateBadge(p.name, latest) + '</div>' +
      '</div>';
    }).join('');
  }

  function renderAbout() {
    var l = L();
    var feats = l.features.map(function (f) { return '<div class="about-feature">' + esc(f) + '</div>'; }).join('');
    var langOpts = [['auto', l.langAuto], ['tr', 'Türkçe'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français']]
      .map(function (o) { return '<option value="' + o[0] + '"' + (state.langSetting === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('');

    document.getElementById('pkgList').innerHTML =
      '<div class="about-panel">' +
        '<div class="about-logo">nLabs NPM Manager</div>' +
        '<div class="about-sub">v0.1.0 · VS Code Extension</div>' +
        '<div class="about-section"><div class="about-section-title">' + esc(l.aboutFeatures) + '</div>' + feats + '</div>' +
        '<div class="about-section"><div class="about-section-title">' + esc(l.aboutInfo) + '</div>' +
          '<div class="about-meta">Publisher: nLabs</div>' +
          '<div class="about-meta">License: MIT</div>' +
          '<div class="about-meta">Requires: Node.js + npm/yarn/pnpm</div>' +
        '</div>' +
        '<div class="about-section"><div class="about-section-title">' + esc(l.aboutSettings) + '</div>' +
          '<div class="about-meta" style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
            '<span style="flex-shrink:0">' + esc(l.aboutLang) + ':</span>' +
            '<select id="langSelect" style="flex:1;padding:3px 6px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);border-radius:2px;font-size:12px">' + langOpts + '</select>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('langSelect').addEventListener('change', function () {
      var val = this.value;
      state.langSetting = val;
      vscode.postMessage({ command: 'setLanguage', lang: val });
      if (val !== 'auto') { state.lang = val; applyStaticTranslations(); renderPackageList(); }
    });
  }

  // ── Render: details ──
  function renderDetails(pkg, details) {
    var col = document.getElementById('colDetails');
    var l = L();
    if (!pkg) {
      col.innerHTML = '<div class="detail-empty"><div class="detail-empty-icon">📦</div><div>' + esc(l.selectHint) + '</div></div>';
      return;
    }

    var installed = getInstalled(pkg.name);
    var latest = state.updateMap[pkg.name.toLowerCase()];
    var allVersions = (details && details.versions) || (pkg.versions || []);
    var latestVer = (details && details.latestVersion) || latest || pkg.version;

    var verOpts = allVersions.map(function (v) {
      var ver = typeof v === 'string' ? v : v.version;
      var isLatest = ver === latestVer;
      var isCur = installed && ver === installed.version;
      var label = esc(ver) + (isLatest ? ' (latest)' : '') + (isCur && !isLatest ? ' (installed)' : '');
      var selected = (latestVer ? isLatest : isCur) ? ' selected' : '';
      return '<option value="' + esc(ver) + '"' + selected + '>' + label + '</option>';
    }).join('') || '<option value="' + esc(pkg.version) + '">' + esc(pkg.version) + '</option>';

    var html = '<div class="detail-header">';
    html += '<div class="detail-top">' +
      '<div class="detail-icon-lg">' + esc((pkg.name || '?').replace(/^@[^/]+\//, '').slice(0,2).toUpperCase()) + '</div>' +
      '<div class="detail-title-wrap">' +
        '<div class="detail-name">' + esc(pkg.name) + '</div>' +
        (pkg.author ? '<div class="detail-author">by ' + esc(pkg.author) + '</div>' : '') +
        (details && details.weeklyDownloads ? '<div class="detail-dl">' + fmtDl(details.weeklyDownloads) + ' ' + l.downloads + '</div>' : '') +
      '</div>' +
    '</div>';

    html += '<div class="detail-action-area">';
    if (installed) {
      html += '<div class="version-row"><span class="version-label">' + l.dInstalled + '</span><span class="version-value">' + esc(installed.version) + '</span></div>';
    }
    if (latest) {
      html += '<div class="version-row"><span class="version-label">' + l.dLatest + '</span><span class="version-new">↑ ' + esc(latest) + '</span></div>';
    }

    var verSel = allVersions.length > 0
      ? '<select id="detailVerSel" style="flex:1">' + verOpts + '</select>'
      : '<select id="detailVerSel" style="flex:1"><option>' + l.loading + '</option></select>';
    html += '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">' +
      '<span style="font-size:11px;color:var(--vscode-descriptionForeground);flex-shrink:0">' + l.dVersion + '</span>' + verSel +
    '</div>';

    html += '<div class="btn-row">';
    if (installed) {
      html += '<button class="btn-secondary" id="btnUpdate">' + l.update + '</button>';
      html += '<button class="btn-danger" id="btnRemove">' + l.remove + '</button>';
    } else {
      html += '<button class="btn-primary" id="btnInstall">' + l.install + '</button>';
      html += '<button class="btn-secondary" id="btnInstallDev">' + l.installDev + '</button>';
    }
    html += '</div></div></div>';

    html += '<div class="detail-body">';
    var desc = (details && details.description) || pkg.description || '';
    if (desc) {
      html += '<div class="detail-section-title">' + l.description + '</div><div class="detail-desc">' + esc(desc) + '</div>';
    }

    if (details) {
      var hasMeta = details.license || details.homepage || details.repository || (details.keywords && details.keywords.length);
      if (hasMeta) {
        html += '<div class="detail-section-title">' + l.info + '</div>';
        if (details.license) {
          html += '<div class="detail-meta-row"><span class="detail-meta-label">' + l.license + '</span><span class="detail-meta-val">' + esc(details.license) + '</span></div>';
        }
        if (details.homepage) {
          html += '<div class="detail-meta-row"><span class="detail-meta-label">' + l.homepage + '</span><span class="detail-meta-val link" data-url="' + esc(details.homepage) + '">' + esc(details.homepage) + '</span></div>';
        }
        if (details.repository) {
          html += '<div class="detail-meta-row"><span class="detail-meta-label">' + l.repo + '</span><span class="detail-meta-val link" data-url="' + esc(details.repository) + '">' + esc(details.repository) + '</span></div>';
        }
        if (details.keywords && details.keywords.length) {
          html += '<div class="tags-wrap">' + details.keywords.slice(0, 20).map(function (k) {
            return '<span class="tag">' + esc(k) + '</span>';
          }).join('') + '</div>';
        }
      }

      var renderDeps = function (depsObj, title) {
        var entries = Object.entries(depsObj || {});
        if (!entries.length) { return ''; }
        var rows = entries.map(function (e) {
          return '<div class="dep-entry"><span>' + esc(e[0]) + '</span><span class="dep-range">' + esc(e[1]) + '</span></div>';
        }).join('');
        return '<div class="detail-section-title">' + title + '</div>' + rows;
      };

      html += renderDeps(details.dependencies, l.deps);
      html += renderDeps(details.devDependencies, l.devDeps);
      html += renderDeps(details.peerDependencies, l.peerDeps);

      if (!Object.keys(details.dependencies || {}).length && !Object.keys(details.devDependencies || {}).length) {
        html += '<div class="detail-section-title">' + l.deps + '</div><div class="no-deps">' + l.noDeps + '</div>';
      }
    } else {
      html += '<div class="loading">' + l.detailLoading + '</div>';
    }

    html += '</div>';
    col.innerHTML = html;

    // Wire buttons
    var btnInstall = document.getElementById('btnInstall');
    if (btnInstall) {
      btnInstall.addEventListener('click', function () {
        var ver = document.getElementById('detailVerSel')?.value || pkg.version;
        btnInstall.disabled = true; btnInstall.textContent = L().installing;
        vscode.postMessage({ command: 'install', name: pkg.name, version: ver, isDev: false });
      });
    }
    var btnInstallDev = document.getElementById('btnInstallDev');
    if (btnInstallDev) {
      btnInstallDev.addEventListener('click', function () {
        var ver = document.getElementById('detailVerSel')?.value || pkg.version;
        btnInstallDev.disabled = true; btnInstallDev.textContent = L().installing;
        vscode.postMessage({ command: 'install', name: pkg.name, version: ver, isDev: true });
      });
    }
    var btnUpdate = document.getElementById('btnUpdate');
    if (btnUpdate) {
      btnUpdate.addEventListener('click', function () {
        var ver = document.getElementById('detailVerSel')?.value || pkg.version;
        btnUpdate.disabled = true; btnUpdate.textContent = L().updating;
        vscode.postMessage({
          command: 'update', name: pkg.name, version: ver,
          current: (installed && installed.version) || '',
          depType: (installed && installed.type) || 'dependencies'
        });
      });
    }
    var btnRemove = document.getElementById('btnRemove');
    if (btnRemove) {
      btnRemove.addEventListener('click', function () {
        btnRemove.disabled = true; btnRemove.textContent = L().removing;
        vscode.postMessage({ command: 'remove', name: pkg.name });
      });
    }
    col.querySelectorAll('.link[data-url]').forEach(function (el) {
      el.addEventListener('click', function () {
        vscode.postMessage({ command: 'openUrl', url: el.getAttribute('data-url') });
      });
    });
  }

  // ── Messages ──
  window.addEventListener('message', function (e) {
    var msg = e.data;
    switch (msg.command) {
      case 'setLang':
        state.lang = msg.lang;
        state.langSetting = msg.setting;
        applyStaticTranslations();
        renderPackageList();
        break;
      case 'projects':
        state.projects = msg.data;
        state.currentProjectPath = msg.current;
        renderProjectList();
        break;
      case 'installed':
        state.installedPackages = msg.data;
        state.updateMap = {};
        state.majorMap = {};
        var badge = document.getElementById('updateCount');
        if (badge) { badge.textContent = ''; }
        renderPackageList();
        if (state.selectedPkg) { renderDetails(state.selectedPkg, null); }
        break;
      case 'searchResults':
        state.searchPackages = msg.data;
        state.currentTab = 'browse';
        document.querySelectorAll('.tab').forEach(function (t, i) { t.classList.toggle('active', i === 0); });
        renderBrowseList();
        break;
      case 'updateInfo':
        msg.data.forEach(function (u) {
          state.updateMap[u.name.toLowerCase()] = u.latest;
          if (u.major) { state.majorMap[u.name.toLowerCase()] = true; }
        });
        var cnt = Object.keys(state.updateMap).length;
        var b = document.getElementById('updateCount');
        if (b) { b.textContent = cnt > 0 ? String(cnt) : ''; }
        renderPackageList();
        if (state.selectedPkg) { renderDetails(state.selectedPkg, null); }
        break;
      case 'versions':
        if (state.selectedPkg && msg.name === state.selectedPkg.name) {
          state.selectedPkg.versions = msg.data;
          renderDetails(state.selectedPkg, null);
        }
        break;
      case 'details':
        if (state.selectedPkg && msg.name === state.selectedPkg.name) {
          renderDetails(state.selectedPkg, msg.data);
        }
        break;
    }
  });

  vscode.postMessage({ command: 'ready' });
  applyStaticTranslations();
  doSearch();

  // ── Resizable gutters ──
  initGutter(document.getElementById('gutter1'), document.getElementById('colProjects'), 120, 400);
  initGutter(document.getElementById('gutter2'), document.getElementById('colDetails'), 160, 600);

  function initGutter(gutter, panel, minW, maxW) {
    var dragging = false, startX = 0, startW = 0;
    var isRight = panel.id === 'colDetails';
    gutter.addEventListener('mousedown', function (e) {
      dragging = true; startX = e.clientX; startW = panel.offsetWidth;
      gutter.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) { return; }
      var diff = isRight ? startX - e.clientX : e.clientX - startX;
      panel.style.width = Math.max(minW, Math.min(maxW, startW + diff)) + 'px';
      panel.style.flex = 'none';
    });
    document.addEventListener('mouseup', function () {
      if (!dragging) { return; }
      dragging = false;
      gutter.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  function findPkg(name) {
    for (var i = 0; i < state.searchPackages.length; i++) {
      if (state.searchPackages[i].name === name) { return state.searchPackages[i]; }
    }
    return null;
  }

  function getInstalled(name) {
    for (var i = 0; i < state.installedPackages.length; i++) {
      if (state.installedPackages[i].name.toLowerCase() === name.toLowerCase()) { return state.installedPackages[i]; }
    }
    return null;
  }

  function fmtDl(n) {
    if (n >= 1000000) { return (n / 1000000).toFixed(1) + 'M'; }
    if (n >= 1000) { return Math.round(n / 1000) + 'K'; }
    return String(n || 0);
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
})();

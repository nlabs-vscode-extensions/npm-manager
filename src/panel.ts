import * as vscode from 'vscode';
import * as path from 'path';
import { searchPackages, getPackageDetails, getLatestVersion, getPackageVersions } from './npmApi';
import { getInstalledPackages, installPackage, removePackage, updatePackage, detectPackageManager, isDeclared } from './packageJsonParser';
import { isNewer, isMajorJump } from './semver';
import { getWebviewContent } from './webview/template';

const log = vscode.window.createOutputChannel('nLabs NPM', { log: true });

export class NpmManagerPanel {
    static currentPanel: NpmManagerPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private projectUri: vscode.Uri;
    private searchToken = 0;

    static createOrShow(extensionUri: vscode.Uri, projectUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
        if (NpmManagerPanel.currentPanel) {
            NpmManagerPanel.currentPanel.switchProject(projectUri);
            NpmManagerPanel.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel(
            'nlabsNpm',
            'nLabs NPM Manager',
            column,
            { enableScripts: true, retainContextWhenHidden: true }
        );
        NpmManagerPanel.currentPanel = new NpmManagerPanel(panel, projectUri, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, projectUri: vscode.Uri, extensionUri: vscode.Uri) {
        this.panel = panel;
        this.projectUri = projectUri;
        const scriptUri = panel.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'main.js')
        );
        this.panel.webview.html = getWebviewContent(panel.webview.cspSource, scriptUri.toString());
        this.panel.onDidDispose(() => { NpmManagerPanel.currentPanel = undefined; });
        this.panel.webview.onDidReceiveMessage(msg => this.handleMessage(msg));
    }

    private switchProject(uri: vscode.Uri) {
        this.projectUri = uri;
        this.sendInstalled();
    }

    private get pm(): string {
        const setting = vscode.workspace.getConfiguration('nlabsNpm').get<string>('packageManager', 'auto');
        if (setting !== 'auto') { return setting; }
        return detectPackageManager(path.dirname(this.projectUri.fsPath));
    }

    private async handleMessage(msg: any) {
        switch (msg.command) {
            case 'ready':
                await this.sendProjects();
                this.sendLanguage();
                await this.sendInstalled();
                break;

            case 'switchProject':
                this.projectUri = vscode.Uri.file(msg.path);
                await this.sendInstalled();
                break;

            case 'setLanguage':
                await vscode.workspace.getConfiguration('nlabsNpm').update('language', msg.lang, vscode.ConfigurationTarget.Global);
                this.sendLanguage();
                break;

            case 'search': {
                const token = ++this.searchToken;
                try {
                    const results = await searchPackages(msg.query, 20, 0);
                    if (token !== this.searchToken) { return; }
                    this.panel.webview.postMessage({ command: 'searchResults', data: results });
                } catch (e: any) {
                    if (token !== this.searchToken) { return; }
                    log.appendLine(`[search] HATA: ${e.message}`);
                    vscode.window.showErrorMessage('NPM arama başarısız.');
                    this.panel.webview.postMessage({ command: 'searchResults', data: [] });
                }
                break;
            }

            case 'install':
                await vscode.window.withProgress(
                    { location: vscode.ProgressLocation.Notification, title: `Yükleniyor: ${msg.name}@${msg.version}` },
                    async () => {
                        try {
                            await installPackage(this.projectUri.fsPath, msg.name, msg.version, this.pm, msg.isDev ? 'devDependencies' : 'dependencies');
                            await this.sendInstalled();
                            vscode.window.showInformationMessage(`${msg.name} yüklendi.`);
                        } catch (e: any) {
                            const applied = isDeclared(this.projectUri.fsPath, msg.name, msg.version);
                            await this.settle(e, applied, `${msg.name} yüklendi`, `${msg.name} yüklenemedi`);
                            await this.sendInstalled();
                        }
                    }
                );
                break;

            case 'remove':
                await vscode.window.withProgress(
                    { location: vscode.ProgressLocation.Notification, title: `Kaldırılıyor: ${msg.name}` },
                    async () => {
                        try {
                            await removePackage(this.projectUri.fsPath, msg.name, this.pm);
                            await this.sendInstalled();
                            vscode.window.showInformationMessage(`${msg.name} kaldırıldı.`);
                        } catch (e: any) {
                            // Kaldirmada basari = artik bildirilmiyor olmasi.
                            const applied = !isDeclared(this.projectUri.fsPath, msg.name);
                            await this.settle(e, applied, `${msg.name} kaldırıldı`, `${msg.name} kaldırılamadı`);
                            await this.sendInstalled();
                        }
                    }
                );
                break;

            case 'update': {
                if (isMajorJump(msg.current ?? '', msg.version) &&
                    !(await this.confirmMajor(msg.name, msg.current, msg.version))) {
                    await this.sendInstalled(); // butonu "Güncelleniyor..." halinden cikar
                    break;
                }
                await vscode.window.withProgress(
                    { location: vscode.ProgressLocation.Notification, title: `Güncelleniyor: ${msg.name} → ${msg.version}` },
                    async () => {
                        try {
                            await updatePackage(this.projectUri.fsPath, msg.name, msg.version, this.pm, msg.depType ?? 'dependencies');
                            await this.sendInstalled();
                            vscode.window.showInformationMessage(`${msg.name} güncellendi.`);
                        } catch (e: any) {
                            const applied = isDeclared(this.projectUri.fsPath, msg.name, msg.version);
                            await this.settle(e, applied, `${msg.name} güncellendi`, `${msg.name} güncellenemedi`);
                            await this.sendInstalled();
                        }
                    }
                );
                break;
            }

            case 'getDetails':
                try {
                    const details = await getPackageDetails(msg.name);
                    this.panel.webview.postMessage({ command: 'details', name: msg.name, data: details });
                } catch {
                    this.panel.webview.postMessage({ command: 'details', name: msg.name, data: null });
                }
                break;

            case 'getVersions':
                try {
                    const versions = await getPackageVersions(msg.name);
                    this.panel.webview.postMessage({ command: 'versions', name: msg.name, data: versions });
                } catch {
                    this.panel.webview.postMessage({ command: 'versions', name: msg.name, data: [] });
                }
                break;

            case 'openUrl': {
                // URL registry metadata'sindan gelir, yani paketi yayinlayanin kontrolunde.
                // Yalniz http/https acilir; diger semalar OS handler'ini tetikleyebilir.
                let uri: vscode.Uri | undefined;
                try { uri = vscode.Uri.parse(msg.url, true); } catch { uri = undefined; }
                if (uri && (uri.scheme === 'http' || uri.scheme === 'https')) {
                    vscode.env.openExternal(uri);
                } else {
                    log.appendLine(`[openUrl] reddedildi: ${msg.url}`);
                }
                break;
            }
        }
    }

    private async sendProjects() {
        const files = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**');
        const skip = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.cache']);
        const projects = files
            .filter(f => !f.fsPath.split(/[\\/]/).some(p => skip.has(p.toLowerCase())))
            .sort((a, b) => a.fsPath.length - b.fsPath.length || a.fsPath.localeCompare(b.fsPath))
            .map(f => ({
                path: f.fsPath,
                label: path.basename(path.dirname(f.fsPath)),
                relative: vscode.workspace.asRelativePath(f)
            }));
        this.panel.webview.postMessage({
            command: 'projects',
            data: projects,
            current: this.projectUri.fsPath
        });
    }

    private async sendInstalled() {
        try {
            const packages = getInstalledPackages(this.projectUri.fsPath);
            this.panel.webview.postMessage({ command: 'installed', data: packages });
            this.fetchUpdateInfo(packages);
        } catch (e: any) {
            log.appendLine(`[nLabs NPM] HATA: ${e.message}`);
            this.panel.webview.postMessage({ command: 'installed', data: [] });
        }
    }

    private async fetchUpdateInfo(packages: { name: string; version: string }[]) {
        if (!packages.length) { return; }
        const results = await Promise.allSettled(
            packages.map(p => getLatestVersion(p.name).then(latest => ({ name: p.name, current: p.version, latest })))
        );
        const updates = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value)
            // Duz esitsizlik yetmez: on surumler, geri gidisler ve ayristirilamayan
            // araliklar (workspace:*, github:...) yanlis pozitif uretiyordu.
            .filter(r => r.latest && isNewer(r.latest, r.current))
            .map(r => ({ ...r, major: isMajorJump(r.current, r.latest) }));
        if (updates.length) {
            this.panel.webview.postMessage({ command: 'updateInfo', data: updates });
        }
    }

    /** Ana surum atlamasi kirilma getirir; kullanici acikca onaylamali. */
    private async confirmMajor(name: string, current: string, next: string): Promise<boolean> {
        const pick = await vscode.window.showWarningMessage(
            `${name}: ${current} -> ${next} ana surum atlamasi`,
            {
                modal: true,
                detail: 'Ana surum atlamalari kirilma degisikligi icerir. Tek bir paketi '
                    + 'ailesinden ayri yukseltmek (ornegin Angular 21 projesinde tek paketi 22 yapmak) '
                    + 'projeyi derlenemez hale getirebilir. Devam edilsin mi?'
            },
            'Devam et'
        );
        return pick === 'Devam et';
    }

    /**
     * Komut sifirdan farkli donduyse bile is yapilmis olabilir (pnpm
     * ERR_PNPM_IGNORED_BUILDS bunu yapiyor). package.json'a bakip karar ver.
     */
    private async settle(e: any, applied: boolean, okMessage: string, failPrefix: string) {
        if (!applied) {
            await this.reportError(failPrefix, e);
            return;
        }
        log.appendLine(`[uyari] ${okMessage} — paket yoneticisi sifirdan farkli kod dondurdu:\n${String(e?.message ?? e)}`);
        const pick = await vscode.window.showWarningMessage(`${okMessage} (uyarılarla)`, 'Ayrıntılar');
        if (pick === 'Ayrıntılar') { log.show(true); }
    }

    /** npm ciktisi cok uzun; kisa mesaj goster, tam metni Output'a birak. */
    private async reportError(prefix: string, e: any) {
        const full = String(e?.message ?? e);
        log.appendLine(`[${prefix}] ${full}`);
        let short = full.split('\n')[0].slice(0, 200);
        if (/ERESOLVE/i.test(full)) {
            short = 'Bagimlilik cakismasi (ERESOLVE): bu surum projedeki diger paketlerin '
                + 'peer bagimliliklariyla uyusmuyor.';
        } else if (/ETARGET|No matching version/i.test(full)) {
            short = 'Istenen surum registry\'de bulunamadi.';
        } else if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED/i.test(full)) {
            short = 'Ag hatasi: registry\'ye ulasilamadi.';
        }
        const pick = await vscode.window.showErrorMessage(`${prefix}: ${short}`, 'Ayrintilar');
        if (pick === 'Ayrintilar') { log.show(true); }
    }

    private sendLanguage() {
        const setting = vscode.workspace.getConfiguration('nlabsNpm').get<string>('language', 'auto');
        const supported = ['tr', 'en', 'de', 'fr'];
        let lang: string;
        if (setting === 'auto') {
            lang = vscode.env.language.split('-')[0].toLowerCase();
            if (!supported.includes(lang)) { lang = 'en'; }
        } else {
            lang = supported.includes(setting) ? setting : 'en';
        }
        this.panel.webview.postMessage({ command: 'setLang', lang, setting });
    }
}

import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { coerce } from './semver';

export type DepType = 'dependencies' | 'devDependencies' | 'peerDependencies';

export interface InstalledPackage {
    name: string;
    /** Karsilastirma icin normallestirilmis surum: "^21.2.0" -> "21.2.0" */
    version: string;
    /** package.json'daki ham deger: "^21.2.0", "workspace:*", "github:..." */
    range: string;
    type: DepType;
}

export function getInstalledPackages(pkgJsonPath: string): InstalledPackage[] {
    const content = fs.readFileSync(pkgJsonPath, 'utf8');
    const json = JSON.parse(content);
    const result: InstalledPackage[] = [];
    const types: DepType[] = ['dependencies', 'devDependencies', 'peerDependencies'];
    for (const type of types) {
        const deps = json[type] ?? {};
        for (const [name, version] of Object.entries(deps)) {
            const range = String(version);
            result.push({ name, version: coerce(range), range, type });
        }
    }
    return result;
}

/**
 * Komut cikis kodu tek basina guvenilir degil: pnpm basarili kurulumdan sonra
 * ERR_PNPM_IGNORED_BUILDS yuzunden sifirdan farkli donebiliyor. Tek dogru kaynak
 * package.json'in kendisi.
 */
export function isDeclared(pkgJsonPath: string, name: string, expectedVersion?: string): boolean {
    let json: any;
    try { json = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')); }
    catch { return false; }
    const types: DepType[] = ['dependencies', 'devDependencies', 'peerDependencies'];
    for (const type of types) {
        const range = json[type]?.[name];
        if (typeof range !== 'string') { continue; }
        if (!expectedVersion) { return true; }
        return coerce(range) === coerce(expectedVersion);
    }
    return false;
}

export function detectPackageManager(pkgJsonDir: string): 'npm' | 'yarn' | 'pnpm' {
    if (fs.existsSync(path.join(pkgJsonDir, 'pnpm-lock.yaml'))) { return 'pnpm'; }
    if (fs.existsSync(path.join(pkgJsonDir, 'yarn.lock'))) { return 'yarn'; }
    return 'npm';
}

// Windows'ta komut satiri shell uzerinden gectigi icin ad/surum kabuk metakarakteri
// icermemeli. Registry'den gelen degerler zaten bu kaliba uyar; uymayan girdi calistirilmaz.
// Ilk karakterde '-' KABUL EDILMEZ: "-rf" gibi bir ad komut satirinda bayrak olarak
// yorumlanir ve paket yoneticisine gecer. npm'in kendi kurallari bunu engellemiyor.
const NAME_RE = /^(?:@[a-z0-9~][a-z0-9-._~]*\/)?[a-z0-9~][a-z0-9-._~]*$/;
const VERSION_RE = /^[A-Za-z0-9][A-Za-z0-9.+\-]*$/;

function assertSafe(name: string, version?: string) {
    if (!NAME_RE.test(name)) { throw new Error(`Gecersiz paket adi: ${name}`); }
    if (version && !VERSION_RE.test(version)) { throw new Error(`Gecersiz surum: ${version}`); }
}

export function installPackage(pkgJsonPath: string, name: string, version: string, pm: string, depType: DepType = 'dependencies'): Promise<string> {
    assertSafe(name, version);
    const dir = path.dirname(pkgJsonPath);
    const pkg = version ? `${name}@${version}` : name;
    const flag = pm === 'yarn'
        ? (depType === 'devDependencies' ? '--dev' : depType === 'peerDependencies' ? '--peer' : '')
        : (depType === 'devDependencies' ? '--save-dev' : depType === 'peerDependencies' ? '--save-peer' : '--save-prod');
    const verb = pm === 'npm' ? 'install' : 'add';
    return runCmd(pm, [verb, pkg, ...(flag ? [flag] : [])], dir);
}

export function removePackage(pkgJsonPath: string, name: string, pm: string): Promise<string> {
    assertSafe(name);
    const dir = path.dirname(pkgJsonPath);
    const args = pm === 'yarn' ? ['remove', name] : ['uninstall', name];
    return runCmd(pm, args, dir);
}

// Guncelleme paketin bulundugu bolumu korumali; aksi halde npm devDependency'yi
// dependencies'e tasir.
export function updatePackage(pkgJsonPath: string, name: string, version: string, pm: string, depType: DepType = 'dependencies'): Promise<string> {
    return installPackage(pkgJsonPath, name, version, pm, depType);
}

export function isNodeAvailable(): Promise<boolean> {
    return new Promise(resolve => {
        const proc = cp.spawn('node', ['--version']);
        proc.on('close', code => resolve(code === 0));
        proc.on('error', () => resolve(false));
    });
}

function runCmd(cmd: string, args: string[], cwd: string): Promise<string> {
    // Windows'ta npm/yarn/pnpm birer .cmd shim'i. Node 20.12+ (CVE-2024-27980) .cmd
    // dosyasini shell olmadan spawn etmeyi EINVAL ile reddediyor, shell'siz cagri ise
    // ENOENT verir. Bu yuzden win32'de shell:true sart; guvenligi assertSafe sagliyor.
    return new Promise((resolve, reject) => {
        const proc = process.platform === 'win32'
            ? cp.spawn([cmd, ...args].join(' '), { cwd, shell: true, windowsHide: true })
            : cp.spawn(cmd, args, { cwd });
        let out = '';
        let err = '';
        proc.stdout?.on('data', d => out += d);
        proc.stderr?.on('data', d => err += d);
        proc.on('close', code => {
            if (code === 0) { resolve(out); }
            else { reject(new Error(err || out)); }
        });
        proc.on('error', reject);
    });
}

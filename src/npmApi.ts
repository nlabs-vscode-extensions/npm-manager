import * as https from 'https';

export interface NpmPackage {
    name: string;
    version: string;
    description: string;
    author: string;
    keywords: string[];
    weeklyDownloads: number;
    links: { npm?: string; homepage?: string; repository?: string };
}

export interface NpmPackageDetails {
    description: string;
    homepage: string;
    repository: string;
    license: string;
    keywords: string[];
    author: string;
    versions: string[];
    latestVersion: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
    weeklyDownloads: number;
}

export function searchPackages(query: string, size = 20, from = 0): Promise<NpmPackage[]> {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}&from=${from}`;
    return httpGet(url).then(json =>
        (json.objects ?? []).map((o: any): NpmPackage => ({
            name: o.package?.name ?? '',
            version: o.package?.version ?? '',
            description: o.package?.description ?? '',
            author: o.package?.publisher?.username ?? o.package?.author?.name ?? '',
            keywords: o.package?.keywords ?? [],
            weeklyDownloads: 0,
            links: o.package?.links ?? {}
        }))
    );
}

export async function getPackageDetails(name: string): Promise<NpmPackageDetails> {
    const [meta, downloads] = await Promise.allSettled([
        httpGet(`https://registry.npmjs.org/${encodeURIComponent(name)}`),
        httpGet(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)
    ]);

    const m = meta.status === 'fulfilled' ? meta.value : {};
    const latest = m['dist-tags']?.latest ?? '';
    const latestMeta = latest ? (m.versions?.[latest] ?? {}) : {};
    const versionsRaw: string[] = Object.keys(m.versions ?? {}).reverse();

    const repo = m.repository?.url ?? latestMeta.repository?.url ?? '';
    const repoClean = repo.replace(/^git\+/, '').replace(/\.git$/, '');

    return {
        description: m.description ?? '',
        homepage: m.homepage ?? latestMeta.homepage ?? '',
        repository: repoClean,
        license: m.license ?? latestMeta.license ?? '',
        keywords: m.keywords ?? [],
        author: m.author?.name ?? (typeof m.author === 'string' ? m.author : ''),
        versions: versionsRaw,
        latestVersion: latest,
        dependencies: latestMeta.dependencies ?? {},
        devDependencies: latestMeta.devDependencies ?? {},
        peerDependencies: latestMeta.peerDependencies ?? {},
        weeklyDownloads: downloads.status === 'fulfilled' ? (downloads.value.downloads ?? 0) : 0
    };
}

export function getPackageVersions(name: string): Promise<string[]> {
    return httpGet(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
        .then(json => Object.keys(json.versions ?? {}).reverse());
}

export function getLatestVersion(name: string): Promise<string> {
    return httpGet(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`)
        .then(json => json.version ?? '');
}

function httpGet(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

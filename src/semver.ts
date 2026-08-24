// Kucuk semver yardimcilari. Disaridan paket almiyoruz; burada ihtiyac duyulan
// tek sey "bu gercekten daha yeni mi" ve "ana surum atlamasi mi" sorulari.
//
// Neden var: onceki surumde guncelleme tespiti duz string karsilastirmasiydi
// (latest !== current). Angular 21 projesine Angular 22 "guncelleme" diye
// gosterildi, tek paket 22'ye cikinca proje derlenmez hale geldi.

export interface Parsed {
    nums: number[];
    pre: string | null;
}

/** "^21.2.0", ">=1.2.3", "~1.2" gibi araliklardan ilk surum benzeri parcayi cikarir. */
export function coerce(range: string): string {
    const s = String(range ?? '').trim();
    const m = /(\d+(?:\.\d+)*(?:-[0-9A-Za-z.-]+)?)/.exec(s);
    return m ? m[1] : s;
}

export function parse(version: string): Parsed | null {
    const v = coerce(version);
    const m = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?$/.exec(v);
    if (!m) { return null; }
    return {
        nums: [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)],
        pre: m[4] ?? null
    };
}

/** -1 / 0 / 1. Ayristirilamayan surum icin null. */
export function compare(a: string, b: string): number | null {
    const pa = parse(a);
    const pb = parse(b);
    if (!pa || !pb) { return null; }
    for (let i = 0; i < 3; i++) {
        if (pa.nums[i] !== pb.nums[i]) { return pa.nums[i] > pb.nums[i] ? 1 : -1; }
    }
    // On surum (1.0.0-rc.1) kararli surumden (1.0.0) once gelir.
    if (pa.pre === pb.pre) { return 0; }
    if (pa.pre === null) { return 1; }
    if (pb.pre === null) { return -1; }
    return pa.pre > pb.pre ? 1 : -1;
}

/** Guncelleme rozetinin sarti: gercekten ileri gidiyor mu. */
export function isNewer(latest: string, current: string): boolean {
    return compare(latest, current) === 1;
}

/** Ana surum atlamasi mi (21 -> 22). Kirilma degisikligi beklenir. */
export function isMajorJump(current: string, latest: string): boolean {
    const a = parse(current);
    const b = parse(latest);
    if (!a || !b) { return false; }
    return b.nums[0] > a.nums[0];
}

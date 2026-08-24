// Bagimliliksiz birim testleri: node --test
// Derlenmis ciktiyi (out/) test eder, once `npm run compile` calistir.
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const parser = require('../out/packageJsonParser.js');
const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

test('getInstalledPackages ucu bolumun tamamini okur', () => {
    const pkgs = parser.getInstalledPackages(path.join(FIXTURES, 'edge-cases', 'package.json'));
    const types = new Set(pkgs.map(p => p.type));
    assert.ok(types.has('dependencies'));
    assert.ok(types.has('devDependencies'));
    assert.ok(types.has('peerDependencies'));
    assert.equal(pkgs.filter(p => p.type === 'peerDependencies').length, 1);
});

test('scoped paket adi bozulmadan gelir', () => {
    const pkgs = parser.getInstalledPackages(path.join(FIXTURES, 'edge-cases', 'package.json'));
    assert.ok(pkgs.some(p => p.name === '@types/node'));
});

test('bagimliligi olmayan proje bos dizi dondurur', () => {
    const pkgs = parser.getInstalledPackages(path.join(FIXTURES, 'empty-deps', 'package.json'));
    assert.deepEqual(pkgs, []);
});

test('surum araliklarindaki on ekler temizlenir', () => {
    const pkgs = parser.getInstalledPackages(path.join(FIXTURES, 'edge-cases', 'package.json'));
    const byName = Object.fromEntries(pkgs.map(p => [p.name, p.version]));
    assert.equal(byName['exact-pin'], '3.0.1');
    assert.equal(byName['@types/node'], '20.19.40');
    assert.equal(byName['tilde-range'], '1.2.0');
    assert.equal(byName['semver-gte'], '1.2.3');
    assert.equal(byName['semver-or'], '1.0.0');
});

test('ham aralik da korunur', () => {
    const pkgs = parser.getInstalledPackages(path.join(FIXTURES, 'edge-cases', 'package.json'));
    const byName = Object.fromEntries(pkgs.map(p => [p.name, p.range]));
    assert.equal(byName['semver-gte'], '>=1.2.3');
    assert.equal(byName['from-git'], 'github:sindresorhus/is-odd');
    assert.equal(byName['aliased'], 'npm:is-odd@^3.0.1');
});

// pnpm basarili kurulumdan sonra ERR_PNPM_IGNORED_BUILDS ile sifirdan farkli
// donebiliyor; o yuzden basari cikis koduyla degil package.json ile olculur.
test('isDeclared bildirilen paketi ve surumu dogrular', () => {
    const p = path.join(FIXTURES, 'plain-npm', 'package.json');
    assert.equal(parser.isDeclared(p, 'is-odd'), true);
    assert.equal(parser.isDeclared(p, 'is-odd', '3.0.1'), true);
    assert.equal(parser.isDeclared(p, 'is-odd', '^3.0.1'), true, 'aralik on eki farki onemsiz');
    assert.equal(parser.isDeclared(p, 'is-odd', '4.0.0'), false, 'farkli surum uygulanmis sayilmaz');
});

test('isDeclared devDependencies ve peerDependencies icinde de arar', () => {
    const p = path.join(FIXTURES, 'edge-cases', 'package.json');
    assert.equal(parser.isDeclared(p, 'tilde-range'), true);
    assert.equal(parser.isDeclared(p, 'react'), true);
});

test('isDeclared olmayan paket ve okunamayan dosyada false doner', () => {
    const p = path.join(FIXTURES, 'plain-npm', 'package.json');
    assert.equal(parser.isDeclared(p, 'boyle-bir-paket-yok'), false);
    assert.equal(parser.isDeclared(path.join(FIXTURES, 'yok.json'), 'is-odd'), false);
});

test('lock dosyasindan paket yoneticisi algilanir', () => {
    assert.equal(parser.detectPackageManager(path.join(FIXTURES, 'plain-npm')), 'npm');
    assert.equal(parser.detectPackageManager(path.join(FIXTURES, 'pnpm-app')), 'pnpm');
    assert.equal(parser.detectPackageManager(path.join(FIXTURES, 'yarn-app')), 'yarn');
});

test('lock yoksa npm varsayilir', () => {
    assert.equal(parser.detectPackageManager(path.join(FIXTURES, 'empty-deps')), 'npm');
});

// Windows'ta komut shell uzerinden gectigi icin bu guard yuk tasiyor.
// DIKKAT: guard delinirse gercekten paket yoneticisi calisir. Bu yuzden bu testler
// fixture'a degil, tek kullanimlik gecici bir dizine bakar - kirlenirse fixture degil o kirlenir.
const os = require('node:os');
const fs = require('node:fs');
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-manager-guard-'));
fs.writeFileSync(path.join(SANDBOX, 'package.json'), '{"name":"sandbox","version":"1.0.0","private":true}');
const SANDBOX_PKG = path.join(SANDBOX, 'package.json');

const INJECTION = [
    'is-odd && calc',
    'is-odd; rm -rf /',
    'is-odd | whoami',
    'is-odd`whoami`',
    '$(whoami)',
    '../../etc/passwd',
    '-rf',            // komut satirinda bayrak olarak yorumlanir
    '--registry=evil.example.com',
    'IS-ODD',         // npm adlari kucuk harf
    '.gizli',
    ''
];

for (const bad of INJECTION) {
    test(`gecersiz ad reddedilir: ${JSON.stringify(bad)}`, () => {
        assert.throws(() => parser.installPackage(SANDBOX_PKG, bad, '1.0.0', 'npm'), /Gecersiz paket adi/);
        assert.throws(() => parser.removePackage(SANDBOX_PKG, bad, 'npm'), /Gecersiz paket adi/);
    });
}

for (const bad of ['3.0.1 && calc', '-rf', '$(whoami)', '1.0.0;calc']) {
    test(`gecersiz surum reddedilir: ${JSON.stringify(bad)}`, () => {
        assert.throws(() => parser.installPackage(SANDBOX_PKG, 'is-odd', bad, 'npm'), /Gecersiz surum/);
    });
}

test('guard yanlis pozitif vermez: scoped ad + pre-release surum', () => {
    // Dogrulamayi gecmeli; spawn'a kadar gitmesin diye olmayan bir arac adiyla cagriliyor.
    const promise = parser.installPackage(SANDBOX_PKG, '@types/node', '20.0.0-beta.1', 'yok-boyle-bir-arac');
    assert.ok(promise instanceof Promise);
    promise.catch(() => {});
});

test('sandbox kirlenmedi - guard hicbir komutu calistirmadi', () => {
    assert.deepEqual(fs.readdirSync(SANDBOX), ['package.json']);
});

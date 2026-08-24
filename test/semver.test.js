const { test } = require('node:test');
const assert = require('node:assert');
const s = require('../out/semver.js');

test('coerce aralik on eklerini temizler', () => {
    assert.equal(s.coerce('^21.2.0'), '21.2.0');
    assert.equal(s.coerce('~1.2.0'), '1.2.0');
    assert.equal(s.coerce('>=1.2.3'), '1.2.3');   // eski kod burada "=1.2.3" birakiyordu
    assert.equal(s.coerce('1.2.3'), '1.2.3');
    assert.equal(s.coerce('^1.0.0 || ^2.0.0'), '1.0.0');
    assert.equal(s.coerce('20.0.0-beta.1'), '20.0.0-beta.1');
});

test('ayristirilamayan aralikler kaza yapmaz', () => {
    assert.equal(s.parse('workspace:*'), null);
    assert.equal(s.parse('*'), null);
    assert.equal(s.compare('github:user/repo', '1.0.0'), null);
    assert.equal(s.isNewer('1.0.0', 'workspace:*'), false);
    assert.equal(s.isMajorJump('workspace:*', '2.0.0'), false);
});

test('compare surumleri sayisal siralar, sozluk sirasina gore degil', () => {
    assert.equal(s.compare('1.10.0', '1.9.0'), 1);   // string karsilastirmasi burada yanilir
    assert.equal(s.compare('2.0.0', '10.0.0'), -1);
    assert.equal(s.compare('1.2.3', '1.2.3'), 0);
});

test('on surum kararli surumden once gelir', () => {
    assert.equal(s.compare('1.0.0-rc.1', '1.0.0'), -1);
    assert.equal(s.isNewer('1.0.0-rc.1', '1.0.0'), false);
    assert.equal(s.isNewer('1.0.0', '1.0.0-rc.1'), true);
});

test('isNewer geri gidisi guncelleme saymaz', () => {
    assert.equal(s.isNewer('1.0.0', '2.0.0'), false);
    assert.equal(s.isNewer('21.2.0', '21.2.0'), false);
    assert.equal(s.isNewer('21.2.16', '21.2.0'), true);
});

// Kullanicinin gercekten yasadigi olay: Angular 21 projesine Angular 22 "guncelleme"
// diye gosterildi, tek paket 22'ye cikti ve proje derlenemez hale geldi.
test('Angular 21 -> 22 ana surum atlamasi olarak isaretlenir', () => {
    assert.equal(s.isMajorJump('21.2.0', '22.1.3'), true);
    assert.equal(s.isNewer('22.1.3', '21.2.0'), true, 'guncelleme olarak gorunmeli...');
    assert.equal(s.isMajorJump('21.2.0', '22.1.3'), true, '...ama onay istemeli');
});

test('ayni ana surum icindeki yukseltme atlamasi degildir', () => {
    assert.equal(s.isMajorJump('21.2.0', '21.2.21'), false);
    assert.equal(s.isMajorJump('21.2.0', '21.9.0'), false);
});

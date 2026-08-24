# Test Fixture Workspace

F5 (Extension Host) ile eklentiyi denerken acilan calisma alani. Her klasor bir
senaryoyu temsil eder:

| Klasor | Ne test eder |
|---|---|
| `plain-npm/` | `package-lock.json` -> npm algilanmali; dependencies + devDependencies birlikte |
| `pnpm-app/` | `pnpm-lock.yaml` -> pnpm algilanmali |
| `yarn-app/` | `yarn.lock` -> yarn algilanmali |
| `edge-cases/` | Surum araligi bicimleri: `>=`, `||`, `*`, `~`, git/file/alias, scoped ad, peerDependencies |
| `empty-deps/` | Bagimlilik yok -> "Yuklu paket yok" bos durumu |

Bu klasor `.vscodeignore` ile paketten haric tutulur; yayinlanan VSIX'e girmez.

Gercek kurulum denemesi icin `plain-npm/` kullan - digerlerine paket kurma,
fixture bozulur (`git checkout test-fixtures` ile geri alinir).

## F5 duman testi

`npm test` yalniz saf mantigi dogrular; webview ve VS Code entegrasyonu elle
denenir. F5 bu klasoru Extension Host'ta acar (`--disable-extensions` ile, diger
eklentiler karismasin diye).

- [ ] Sol sutunda bes fixture projesi de listeleniyor
- [ ] `edge-cases` secilince peerDependencies ayri rozetle gorunuyor, `@types/node` adi bozulmamis
- [ ] `empty-deps` secilince "Yuklu paket yok" bos durumu cikiyor, panel patlamiyor
- [ ] Arama kutusuna `is-odd` yazip Enter -> sonuclar geliyor
- [ ] Bir pakete tiklayinca sag sutunda detay + surum listesi doluyor
- [ ] `plain-npm`'e paket kur -> `package.json`'a `dependencies` altina yaziliyor
- [ ] Ayni pakete "Dev Yukle" -> `devDependencies` altina yaziliyor
- [ ] devDependency'yi guncelle -> **bolum degismiyor** (dependencies'e tasinmamali)
- [ ] Kaldir -> paket `package.json`'dan siliniyor
- [ ] `pnpm-app` / `yarn-app` secilince dogru paket yoneticisi kullaniliyor
      (Output > "nLabs NPM" kanalindan veya kurulan lock dosyasindan dogrula)
- [ ] Hakkinda sekmesinde dil degistir -> arayuz o dile geciyor
- [ ] Detaydaki Ana sayfa / Kaynak baglantilari tarayicida aciliyor
- [ ] Sutun ayiraclarini surukle -> genislik degisiyor

Test sonrasi `plain-npm/` icindeki degisiklikleri geri al.

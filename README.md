# KRM Design — Next.js + JavaScript

Bu teslim, mevcut KRM Design portfolyosunun gerçek Next.js App Router'a taşınmış, frontend ve backend'i ayrılmış sürümüdür. Arayüz ve sunucu kodu JavaScript / JSX'tir.

## Hızlı kurulum

Gereksinim: **Node.js 24.x ve npm**. ZIP'i açıp `KRM-Design-NextJS` klasöründe terminal açın:

```bash
npm ci
npm run admin:setup
npm run build
npm start
```

`admin:setup` kendi admin e-posta adresinizi ve en az 12 karakterlik şifrenizi ister. Şifre ekranda gösterilmez; veritabanında scrypt özeti tutulur. Hazır veya ortak admin şifresi yoktur.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Geliştirme: `npm run dev`
- Backend testleri: `npm test`
- Üretim entegrasyon testi: `npm run test:smoke` (önce build gerekir)

Paket, doğrulanmış `.next` üretim çıktısını da içerir. Farklı bir işletim sisteminde kullanırken `npm ci` ve `npm run build` ile yeniden derlemek önerilir. `node_modules` dahil değildir; bağımlılıklar `package-lock.json` ile sabitlenmiştir.

## Klasör yapısı

| Klasör | İşlev |
|---|---|
| `frontend/app` | Next.js sayfaları, metadata, hata ekranı ve API geçidi |
| `frontend/components` | Ana sayfa, dil/tema, dünya modeli, galeri ve admin arayüzü |
| `frontend/lib` | Çeviriler ve sunucu tarafı backend istemcisi |
| `frontend/public` | Portfolyo görselleri, harita ve favicon |
| `frontend/.next` | Test edilmiş üretim derlemesi |
| `backend/src` | HTTP API, oturumlar, SQLite, yükleme ve görsel işleme |
| `backend/tests` | 16 gerçek veritabanı / API testi |
| `scripts` | Birlikte çalıştırma ve üretim entegrasyon testi |
| `verification` | Derleme ve test çıktıları |

Frontend `/api/*` isteklerini kendi sunucusundan backend'e iletir. Veritabanı, kimlik doğrulama, doğrulama kuralları ve görsel dosyaları backend tarafından yönetilir. Tarayıcı backend portuna doğrudan bağlanmaz. Next.js tarafında kalan API dosyası yalnızca geçittir.

## Ayrı çalıştırma

İki ayrı terminalde:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Üretimde:

```bash
npm run start --workspace backend
npm run start --workspace frontend
```

Backend tek Node süreci ve kalıcı yerel disk için hazırlanmıştır. SQLite veritabanını geçici / salt okunur serverless diske koymayın. Çoklu sunucu kurulumu bu teslimin kapsamı değildir.

## Ortam ayarları

Varsayılan localhost kurulumu ek dosya gerektirmez. Özelleştirmek için:

1. `backend/.env.example` → `backend/.env`
2. `frontend/.env.example` → `frontend/.env.local`

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `BACKEND_PORT` | `4000` | Backend portu |
| `BACKEND_HOST` | `127.0.0.1` | Backend dinleme adresi |
| `PUBLIC_ORIGIN` | `http://localhost:3000` | Tarayıcıdan kullanılan tam origin; sonunda `/` yok |
| `DATA_DIR` | `data` | Backend klasörüne göre veri dizini; mutlak yol da olabilir |
| `BACKEND_URL` | `http://127.0.0.1:4000` | Next.js sunucusunun backend adresi |

`localhost` ve `127.0.0.1` aynı origin değildir. Yerel sitede `http://localhost:3000` kullanın. Alan adıyla yayınlarken `PUBLIC_ORIGIN=https://alanadiniz.com` ayarlayın; HTTPS reverse proxy'yi Next.js portuna yönlendirin. Bu ayar oturum çerezinin `Secure` özelliğini de açar. Backend'i halka açık erişime açmak gerekmez.

## Veri ve yedekleme

İlk çalıştırmada `backend/data/portfolio.sqlite` oluşturulur ve kaynakta bulunan altı portfolyo projesi yalnızca bir kez eklenir. Silinen bir proje sonraki açılışta kendiliğinden geri gelmez.

Yüklenen resimler `backend/data/media` içinde tutulur. Orijinal dosya, 1800 piksele kadar ana WebP ve 600 piksele kadar küçük WebP saklanır. Galeri resmi yalnızca bir yayınlanmış projede kullanılıyorsa ziyaretçilere açılır; taslak ve çöp kutusu resimleri admin oturumu gerektirir. Orijinaller HTTP üzerinden sunulmaz. Silme işlemi görselleri diskte korur.

Yedek almak için iki servisi durdurun ve **tüm `backend/data` klasörünü** kopyalayın. Geri yüklemek için servisler kapalıyken bu klasörü yedeğiyle değiştirin. SQLite `-wal` / `-shm` dosyaları varsa onları da dahil edin. Özel `DATA_DIR` kullanıyorsanız o dizini yedekleyin. Bu dizin admin hesabı, başvurular ve oturumlar da içerir; herkese açık bir klasöre koymayın.

Paket, önceki canlı sistemin D1/R2 verilerinin yedeği değildir. Mevcut kaynak kodundaki görseller ve başlangıç projeleri dahildir; canlı sistemde sonradan kaydedilen projeler, başvurular ve yüklemeler bu ZIP'e aktarılmış sayılmamalıdır. Canlı veri aktarımı için önceki sistemden ayrıca veri/dosya dışa aktarımı gerekir.

## Yönetim

- Proje oluşturma, taslak/yayın, ana sayfada görünme ve hero adayı seçimi.
- Proje sırası: sürükleme veya yukarı/aşağı düğmeleri; sıra ayrı kaydedilir.
- Fotoğraf sırası: sürükleme veya oklar; ilk görsel kapak olur.
- Silme: onay ardından çöp kutusu; geri yükleme her zaman **taslak** oluşturur.
- Kayıt sürümü: başka sekmede değişen proje veya ayar için 409 çakışma mesajı. Yenilemeden eski kayıt yeni kaydı ezemez.
- Kaydedilmemiş değişiklik uyarısı; ayarlar yüklenmeden kaydetme kapalıdır.
- Yükleme kısmen başarısız olursa başarılı görseller açık taslakta kalır; korumak için projeyi kaydedin.
- Şifre değiştirmek için aynı e-postayla `npm run admin:setup` çalıştırın. O hesabın mevcut oturumları iptal edilir.

## Tasarım ve diller

Mevcut portfolyo tasarımı, koyu tema geçişi, hover efektleri, galeri yakınlaştırma/sürükleme, dünya yakınlaştırma/döndürme kontrolleri korunmuştur. Türkçe, İspanyolca, Almanca, Fransızca, Norveççe Bokmål ve İtalyanca seçenekleri İngilizceyle birlikte bulunur. Kullanıcının yazdığı özel proje içeriği otomatik çevrilmez; dil seçimi cihaz çereziyle saklanır. Her dil için ayrı SEO URL'si bu teslimde eklenmemiştir.

## Doğrulama ve kapsam

`verification/SONUCLAR.md` uygulanan geliştirmeleri, gerçek test sonuçlarını ve doğrulama sınırlarını açıklar. Bu paket bağımsız Node.js dağıtımıdır; eski canlı adrese otomatik olarak yayınlanmamıştır.

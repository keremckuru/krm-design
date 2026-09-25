# Teslim doğrulaması

## Geçiş

- Next.js **16.3.4**, React **19.2.6**, JavaScript / JSX.
- Vite/Vinext ve Cloudflare çalışma zamanı bağımlılığı uygulama akışından kaldırıldı.
- Ayrı frontend/backend paketleri, kök npm workspace, kilitli bağımlılıklar.
- SQLite kalıcı proje, ayar, oturum, başvuru ve medya ilişkileri; tek seferlik seed.
- Hazır şifre içermeyen admin kurulumu; scrypt, HttpOnly / SameSite oturumu, origin doğrulaması.

## Uygulanan düzeltmeler

1. Proje ve ayar kayıtlarında iyimser sürüm kontrolü.
2. Sıralama yalnızca sıra kolonunu günceller; eski listeyle sıralama engellenir.
3. Kaydedilmemiş değişikliklerde proje değiştirme / sayfadan ayrılma uyarısı.
4. Ayarlar alınamazsa boş ayarların kaydedilmesi engellenir.
5. Veritabanı hatasında seed içerik tekrar gösterilmez; hata ekranı açılır.
6. Çöp kutusu ve taslak olarak geri yükleme.
7. Medya görünürlüğü indeksli ilişki sorgusuyla kontrol edilir; her resimde tüm katalog okunmaz.
8. Orijinal görsel saklama, sunucu tarafında format/piksel sınırı kontrolü, 600/1800 WebP üretimi.
9. Kısmi yüklemede başarılı dosyalar taslakta kalır.
10. Dünya modeli ana sayfada görünür alana yaklaşınca yüklenir; coğrafya çizim yolları hover sırasında yeniden hesaplanmaz; sürükleme RAF ile sınırlandırılır.
11. Birleşik Krallık harita geometrisi İngiltere diye yeniden etiketlenmez; futbol ülkeleri coğrafyaya eşlenir.
12. Arşiv filtreleri URL'ye yazılır ve paylaşılabilir.
13. Başvurularda doğrulama, honeypot, kalıcı hız sınırı ve aynı içerik için tekrar engeli.
14. Proje bazlı sayfa başlığı/açıklaması; yayınlanmamış ve silinmiş projelerde 404.
15. Ana sayfa sayacı gösterilen proje sayısıyla eşleşir; başlık/sayaç için akış tabanlı yerleşim.
16. Azaltılmış hareket tercihi, odak göstergeleri ve küçük ekran kontrol yerleşimleri.

## Çalıştırılan kontroller

- `npm run build`: başarılı; gerçek Next.js üretim çıktısı oluştu.
- `npm test`: **16/16 başarılı**. Gerçek SQLite, parola doğrulama, oturum, revision çakışmaları, silme/restore, seed'in yeniden eklenmemesi, medya yükleme/erişim, rollback, başvuru sınırı ve çıkış.
- `npm run test:smoke`: **17/17 başarılı**. Gerçek Next.js + backend HTTP sunucuları, sekiz sayfa, admin yönlendirmesi, API koruması, 404, giriş çerezi, admin render, API geçidi, proje kaydı, güncel metadata ve çıkış sonrası erişim reddi.
- ZIP bütünlüğü ve çıkartılan paketin dosya hash'leri teslim aşamasında kontrol edilir.

## Sınırlar

Bu sonuçlar tüm cihazlarda veya tüm hosting ortamlarında sıfır hata garantisi değildir. Bu ortamda tarayıcı önizlemesine bağlantı kurulamadığından son sürümün görsel / dokunmatik etkileşim testi tamamlanamadı. Lighthouse puanı veya gerçek mobil cihaz testi iddia edilmemektedir.

Önceki rapordaki daha geniş ürün önerileri (dil bazlı URL ve içerik editörü, kapsamlı case-study blok editörü, revizyon geçmişini arayüzden karşılaştırma, otomatik uzak yedekleme, e-posta gönderim hizmeti, çoklu sunucu mimarisi) bu geçişin kapsamında uygulanmadı. Değişiklik öncesi proje sürümleri veritabanında saklanır; bunlar için ayrı geçmiş ekranı yoktur. Başvurular panelde saklanır, otomatik e-posta gönderilmez.

Canlı eski sistemin sonradan oluşan verileri bu kaynak kodu paketine dahil değildir. Ayrıntılar ana README'dedir.

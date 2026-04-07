# MoodMate CLI

**MoodMate**, sevdiğiniz insanlarla olan ilişkilerinizi güçlendirmek, kırgınlıkları onarmak ve mutlulukları paylaşmak için tasarlanmış, **AI (Yapay Zeka)** destekli bir terminal asistanıdır.

Google'ın **Gemini AI** modelini kullanarak, belirlediğiniz kişilerin kişilik özelliklerine, ilgi alanlarına ve aranızdaki ilişkiye göre size özel, somut ve yaratıcı tavsiyeler sunar.

---

## Özellikler

### Gelismis Profil Yonetimi
- Farklı kişiler için (Sevgili, Kanka, Anne vb.) ayrı profiller oluşturun.
- Kişilik özelliklerini, sevmediği şeyleri, yaş grubunu ve iletişim tarzını tanımlayarak AI'nın karakteri tanımasını sağlayın.
- Profilleri istediğiniz zaman güncelleyin veya silin.

### Yerel Stratejiler ve Basari Takibi
- **Cevrimdisi Strateji Modu**: AI yerine, ilişki bilimi ve kişilik profillerine dayalı yerel kurallarla strateji oluşturun.
- **Basari Gunlugu (Success Log)**: Hangi yaklaşımınızın işe yaradığını kaydedin. Kendi deneyimlerinizden oluşan kişisel bir "kullanım kılavuzu" oluşturun.
- **Kisilik Bazli Taktikler**: Alıngan, inatçı veya esprili karakterlere özel yerleşik yaklaşım tavsiyeleri.

### Geçmiş Kaydi
- Her kişi için üretilen tüm tavsiyeler (AI veya Yerel) ve mesajlar otomatik olarak kaydedilir.

### Genişletilmiş Bilgi Kutuphanesi
- İnternet bağlantısı olmasa bile erişebileceğiniz; hobi, hediye, date fikirleri ve iletişim kuralları içeren zengin bir kütüphane.

### Yerel Depolama
- Tüm verileriniz `data/` klasörü altındaki JSON dosyalarında güvenle saklanır. Harici bir veritabanı veya bulut depolama gerektirmez.

---

## Kurulum ve Yapilandirma

Uygulamayı yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi Indirin:**
    ```bash
    git clone https://github.com/muhsinlight/MoodMate.git
    cd MoodMate
    ```

2.  **Bagimliliklari Yukleyin:**
    ```bash
    npm install
    ```

3.  **Global Komut Olarak Ayarlayin (Opsiyonel):**
    Uygulamayı herhangi bir klasörden `moodmate` yazarak çalıştırmak için:
    ```bash
    npm link
    ```

4.  **API Anahtarini Ayarlayin:**
    - `.env.example` dosyasını kopyalayıp adını `.env` yapın.
    - [Google AI Studio](https://aistudio.google.com/app/apikey) üzerinden aldığınız Gemini API anahtarını ilgili yere yapıştırın:
      ```env
      GEMINI_API_KEY=YOUR_API_KEY_HERE
      ```

---

## Calistirma

Eğer `npm link` yaptıysanız, sadece şunu yazın:
```bash
moodmate
```

Veya manuel olarak:
```bash
node index.js
```

---

## Teknolojiler

- **Runtime:** Node.js
- **Yapay Zeka:** Gemini AI (Google)
- **Arayüz:** Enquirer (Interaktif CLI)
- **Tasarım:** Chalk, Boxen, Figlet
- **Veri:** Yerel JSON (Gizlilik odaklı)

---

## Klasor Yapisi

```text
MoodMate/
├── data/               # Yerel veritabanı (Görmezden gelindi .gitignore)
├── src/                # Kaynak kodlar
│   ├── actions.js      # Menü aksiyonları ve mantığı
│   ├── ai.js           # Gemini AI entegrasyonu
│   ├── config.js       # Yapılandırmalar
│   ├── peopleManager.js # Veri yönetim katmanı
│   ├── strategies.js   # Çevrimdışı strateji motoru
│   └── ui.js           # Görsel başlık ve tasarım
├── index.js            # Ana giriş noktası ve menü yönlendirme
├── .env.example        # Örnek yapılandırma
├── .gitignore          # Git tarafından dışlanan dosyalar
└── package.json        # Bağımlılıklar ve scriptler
```



## Notlar

- Uygulama tamamen **gizlilik odaklıdır**; verileriniz sunucuya değil, kendi bilgisayarınızdaki `data/` klasörüne kaydedili

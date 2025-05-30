# Bilkent Kütüphanesi Turnike Geçiş Takvimi

Bu uygulama, kütüphane turnike geçiş verilerini görselleştiren interaktif bir takvim uygulamasıdır. CSV ve XLSX formatlarındaki veri dosyalarını yükleyerek kütüphane kullanım yoğunluğunu yıl, ay ve gün bazında analiz edebilirsiniz.

## Özellikler

- 📅 **Çoklu Görünüm**: Yıl, ay ve gün bazında detaylı görüntüleme
- 📊 **Veri Analizi**: Günlük, aylık ve yıllık istatistikler
- 🎨 **Görsel Yoğunluk Haritası**: Renk kodlu yoğunluk gösterimleri
- 📁 **Çoklu Dosya Desteği**: Birden fazla CSV/XLSX dosyası yükleme
- 🕐 **Saatlik Detay**: Günlük saatlik kullanım analizi
- 📱 **Responsive Tasarım**: Tüm cihazlarda uyumlu arayüz

## Teknolojiler

- **React 18**: Modern React hooks ile geliştirildi
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon kütüphanesi
- **SheetJS (XLSX)**: Excel dosya işleme
- **Vercel**: Deployment ve hosting

## Kurulum

### Yerel Geliştirme

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/library-calendar-app.git
cd library-calendar-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Tailwind CSS'i yükleyin:
```bash
npm install -D tailwindcss postcss autoprefixer
```

4. Uygulamayı başlatın:
```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Veri Formatı

Uygulama aşağıdaki formattaki CSV/XLSX dosyalarını destekler:

```csv
Tarih Saat,Diğer Sütunlar...
01.01.2024 09.30,
01.01.2024 10.15,
02.01.2024 14.22,
```

**Önemli**: 
- Tarih/saat bilgisi içeren sütun başlığında "tarih", "saat", "date" veya "time" kelimelerinden biri bulunmalıdır
- Tarih formatı: `DD.MM.YYYY HH.MM` şeklinde olmalıdır

## Kullanım

1. **Dosya Yükleme**: Ana sayfada "Dosya Seç" butonunu kullanarak CSV veya XLSX dosyalarınızı yükleyin
2. **Yıl Görünümü**: Tüm ayları bir arada görerek genel durumu inceleyin
3. **Ay Görünümü**: Belirli bir aya tıklayarak günlük detayları görün
4. **Gün Görünümü**: Belirli bir güne tıklayarak saatlik analizi inceleyin

## Deploy Etme

### Vercel ile Deploy

1. [Vercel](https://vercel.com) hesabınızla giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub reponuzu seçin
4. Build ayarları otomatik olarak algılanacaktır:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. "Deploy" butonuna tıklayın

### Environment Variables

Herhangi bir environment variable'a ihtiyaç yoktur.

## Proje Yapısı

```
library-calendar-app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── LibraryCalendarApp.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── .gitignore
└── README.md
```

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Proje Sahibi - [@kullaniciadi](https://github.com/kullaniciadi)

Proje Linki: [https://github.com/kullaniciadi/library-calendar-app](https://github.com/kullaniciadi/library-calendar-app)

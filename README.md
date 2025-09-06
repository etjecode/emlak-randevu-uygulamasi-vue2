# Emlak Randevu Uygulaması

Basit bir başlangıç iskeleti. **Vue 2 (v2.7)** ve **Vite** ile geliştirme için hazırlanmıştır.

## 🚀 Özellikler

- Vue 2.7 (Options API)
- Vite ile hızlı geliştirme ve derleme
- Tek sayfa uygulama başlangıç yapısı (App.vue + main.js)

## 📦 Kurulum

### Gereksinimler
- Node.js **>= 18.x** (LTS önerilir)
- npm (veya yarn/pnpm)

### Adımlar
```bash
# bağımlılıkları yükle
npm install

# geliştirme sunucusunu başlat
npm run dev

# production için derle
npm run build

# build önizlemesi
npm run preview
```

## 📁 Proje Yapısı (minimal)

```
├── src/
│   ├── App.vue        # kök bileşen
│   └── main.js        # giriş noktası
├── index.html         # uygulama şablonu
├── vite.config.mjs    # Vite yapılandırması (Vue2 plugin)
└── package.json
```

## 🔧 Kullanılan Teknolojiler (şu anki sade kurulum)

- [Vue 2.7](https://v2.vuejs.org/)  
- [Vite](https://vitejs.dev/)  
- [vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

## 📜 Lisans
[ISC](LICENSE)
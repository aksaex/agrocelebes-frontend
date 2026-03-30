import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Kamus Bahasa (Bisa ditambah terus nanti)
const resources = {
  id: {
    translation: {
      "tambah_komoditas": "Tambah Komoditas",
      "katalog": "Katalog Komoditas Sulawesi",
      "cari": "Cari produk...",
      "keluar": "Keluar",
      "profil": "Profil Saya"
    }
  },
  en: {
    translation: {
      "tambah_komoditas": "Add Commodity",
      "katalog": "Sulawesi Commodity Catalog",
      "cari": "Search products...",
      "keluar": "Log Out",
      "profil": "My Profile"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "id", // Bahasa default
    interpolation: { escapeValue: false }
  });

export default i18n;
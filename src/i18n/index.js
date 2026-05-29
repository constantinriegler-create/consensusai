import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'

const activeLang = localStorage.getItem('language') || 'en'

// English is always bundled — it's the fallback and the most common language.
// Other locales are split into separate chunks and loaded only when needed.
i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: activeLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

if (activeLang !== 'en') {
  import(`./${activeLang}.json`).then(mod => {
    i18n.addResourceBundle(activeLang, 'translation', mod.default, true, true)
    // Re-apply so react-i18next re-renders with the loaded translations
    i18n.changeLanguage(activeLang)
  })
}

// Called by the language switcher — loads the locale chunk on first use
export function loadLanguage(lang) {
  if (lang === 'en' || i18n.hasResourceBundle(lang, 'translation')) {
    return Promise.resolve()
  }
  return import(`./${lang}.json`).then(mod => {
    i18n.addResourceBundle(lang, 'translation', mod.default, true, true)
  })
}

export default i18n

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import de from './de.json'
import ko from './ko.json'
import es from './es.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      ko: { translation: ko },
      es: { translation: es },
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

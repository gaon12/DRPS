// translations.js
import en from './langs/en.json';
import ko from './langs/ko.json';

const translations = {
  en,
  ko
};

export function translate(langCode, key) {
  if (translations[langCode] && translations[langCode][key]) {
    return translations[langCode][key];
  } else if (translations['en'] && translations['en'][key]) {
    // Default to English if key not found in selected language
    return translations['en'][key];
  } else {
    return key;
  }
}

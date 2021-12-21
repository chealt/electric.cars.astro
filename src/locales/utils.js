import locales from '../locales/config.json';
import enGB from './en-GB.json';
import enUS from './en-US.json';
import huHU from './hu-HU.json';

const localeData = {
  'en-GB': enGB,
  'en-US': enUS,
  'hu-HU': huHU
};

const getLocale = (code) => locales.find((locale) => locale.code === code);
const getLocaleData = (code) => (key) => {
  if (!localeData[code]) {
    return localeData['en-US'][key];
  }

  return localeData[code][key];
};

export { getLocale, getLocaleData };

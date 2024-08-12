// atom.js
import { atom } from 'recoil';

export const langState = atom({
  key: 'langState',
  default: 'en',
});

export const themeState = atom({
  key: 'themeState',
  default: 'light',
});

export const webviewState = atom({
  key: 'webviewState',
  default: 'false',
})
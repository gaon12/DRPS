import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Context 생성
export const SettingsContext = createContext();

// Provider 컴포넌트
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    isDarkMode: false,  // 다크모드 설정
    language: 'en',     // 언어 설정
    notifications: true, // 알림 설정
    webviewUsage: true  // 웹뷰 사용 설정
  });

  // SecureStore에서 설정값을 불러오는 함수
  const loadSettings = async () => {
    try {
      const savedSettings = await Promise.all([
        SecureStore.getItemAsync('Settings_DarkMode'),
        SecureStore.getItemAsync('Settings_Language'),
        SecureStore.getItemAsync('Settings_Notifications'),
        SecureStore.getItemAsync('Settings_WebviewUsage')
      ]);

      setSettings({
        isDarkMode: savedSettings[0] ? JSON.parse(savedSettings[0]) : false,
        language: savedSettings[1] || 'en',
        notifications: savedSettings[2] ? JSON.parse(savedSettings[2]) : true,
        webviewUsage: savedSettings[3] ? JSON.parse(savedSettings[3]) : true
      });
    } catch (error) {
      console.error("Failed to load settings: ", error);
    }
  };

  // 설정값을 SecureStore에 저장하는 함수
  const saveSetting = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: value
      }));
    } catch (error) {
      console.error("Failed to save setting: ", error);
    }
  };

  // 설정값 변경을 위한 함수
  const updateSetting = (key, value) => {
    saveSetting(key, value);
  };

  // 앱 로드시 설정값을 불러옴
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

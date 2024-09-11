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
			// SecureStore에서 설정값 불러오기
			const savedDarkMode = await SecureStore.getItemAsync('Settings_DarkMode');
			const savedLanguage = await SecureStore.getItemAsync('Settings_Language');
			const savedNotifications = await SecureStore.getItemAsync('Settings_Notifications');
			const savedWebviewUsage = await SecureStore.getItemAsync('Settings_WebviewUsage');

			// 불러온 설정값으로 상태 업데이트
			setSettings({
				isDarkMode: savedDarkMode === 'Yes',  // 'Yes'를 true로 변환
				language: savedLanguage || 'en',       // 언어 기본값 'en'
				notifications: savedNotifications === 'Yes', // 'Yes'를 true로 변환
				webviewUsage: savedWebviewUsage === 'Yes'  // 'Yes'를 true로 변환
			});
		} catch (error) {
			console.error("Failed to load settings: ", error);
		}
	};

	// 설정값을 SecureStore에 저장하는 함수
	const saveSetting = async (key, value) => {
		try {
			await SecureStore.setItemAsync(key, value ? 'Yes' : 'No');  // true/false 대신 'Yes'/'No'로 저장
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

import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Create Context
export const SettingsContext = createContext();

// Provider Component
export const SettingsProvider = ({ children }) => {
	const [settings, setSettings] = useState({
		isDarkMode: false,
		language: 'en',
		notifications: true,
		webviewUsage: true,
		useOpenStreetMap: false,
		selectedDisaster: '자연 재난',
		location: { latitude: null, longitude: null }, // 위치 정보 추가
		ttsOption: { language: {}, ttsService: '' }, // TTS 옵션 추가
	});

	// Function to load settings from SecureStore
	const loadSettings = async () => {
		try {
			const savedDarkMode = await SecureStore.getItemAsync('Settings_DarkMode');
			const savedLanguage = await SecureStore.getItemAsync('Settings_Language');
			const savedNotifications = await SecureStore.getItemAsync('Settings_Notifications');
			const savedWebviewUsage = await SecureStore.getItemAsync('Settings_WebviewUsage');
			const savedUseOpenStreetMap = await SecureStore.getItemAsync('Settings_UseOpenStreetMap');
			const savedSelectedDisaster = await SecureStore.getItemAsync('Settings_SelectedDisaster');
			const savedLatitude = await SecureStore.getItemAsync('Settings_Latitude');
			const savedLongitude = await SecureStore.getItemAsync('Settings_Longitude');
			const savedTTS = await SecureStore.getItemAsync('TTS_Settings');

			const ttsOption = savedTTS ? JSON.parse(savedTTS) : { language: {}, ttsService: '' };

			setSettings({
				isDarkMode: savedDarkMode === 'Yes',
				language: savedLanguage || 'en',
				notifications: savedNotifications === 'Yes',
				webviewUsage: savedWebviewUsage === 'Yes',
				useOpenStreetMap: savedUseOpenStreetMap === 'Yes',
				selectedDisaster: savedSelectedDisaster || '자연 재난',
				location: {
					latitude: savedLatitude ? parseFloat(savedLatitude) : null,
					longitude: savedLongitude ? parseFloat(savedLongitude) : null,
				},
				ttsOption, // TTS 옵션 설정
			});

			console.log('설정 로드 완료:', ttsOption);
		} catch (error) {
			console.error("Failed to load settings: ", error);
		}
	};

	// Function to save settings to SecureStore
	const saveSetting = async (key, value) => {
		try {
			if (key === 'ttsOption') {
				await SecureStore.setItemAsync('TTS_Settings', JSON.stringify(value));
			} else {
				await SecureStore.setItemAsync(key, value);
			}

			setSettings((prevSettings) => ({
				...prevSettings,
				[key]: value,
			}));
		} catch (error) {
			console.error("Failed to save setting: ", error);
		}
	};

	// Function to update location
	const updateLocation = async (latitude, longitude) => {
		try {
			await SecureStore.setItemAsync('Settings_Latitude', latitude.toString());
			await SecureStore.setItemAsync('Settings_Longitude', longitude.toString());

			setSettings((prevSettings) => ({
				...prevSettings,
				location: { latitude, longitude },
			}));
		} catch (error) {
			console.error("Failed to save location: ", error);
		}
	};

	// Function to update settings like selectedDisaster
	const updateSetting = (key, value) => {
		saveSetting(key, value);
	};

	// settings 상태가 변경될 때마다 콘솔에 출력
	useEffect(() => {
		console.log('현재 설정 값:', settings);
	}, [settings]); // settings가 변경될 때마다 실행

	// Load settings on app start
	useEffect(() => {
		loadSettings();
	}, []);

	return (
		<SettingsContext.Provider value={{ settings, updateSetting, updateLocation }}>
			{children}
		</SettingsContext.Provider>
	);
};

import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Create Context
export const SettingsContext = createContext();

// Provider Component
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        isDarkMode: false,
        language: 'ko',
        notifications: true,
        webviewUsage: true,
        useOpenStreetMap: false,
        selectedDisaster: '자연 재난',
        location: { latitude: null, longitude: null },
        ttsOption: { language: {}, ttsService: '' },
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
			const savedUseTTs = await SecureStore.getItemAsync('Settings_UseTTs');
			const savedTTS = await SecureStore.getItemAsync('TTS_Settings');
	
			// TTS 옵션이 없을 경우 기본 값으로 빈 객체 설정
			const ttsOption = savedTTS 
				? JSON.parse(savedTTS) 
				: { language: {}, ttsService: '' };
	
			setSettings({
				isDarkMode: savedDarkMode === 'Yes',
				language: savedLanguage || 'ko',
				notifications: savedNotifications === 'Yes',
				webviewUsage: savedWebviewUsage === 'Yes',
				useOpenStreetMap: savedUseOpenStreetMap === 'Yes',
				selectedDisaster: savedSelectedDisaster || '자연 재난',
				location: {
					latitude: savedLatitude ? parseFloat(savedLatitude) : null,
					longitude: savedLongitude ? parseFloat(savedLongitude) : null,
				},
				useTTs: savedUseTTs === 'Yes',
				ttsOption,  // TTS 설정 반영
			});
	
			console.log('설정 로드 완료:', {
				isDarkMode: savedDarkMode,
				language: savedLanguage,
				notifications: savedNotifications,
				webviewUsage: savedWebviewUsage,
				useOpenStreetMap: savedUseOpenStreetMap,
				selectedDisaster: savedSelectedDisaster,
				location: { latitude: savedLatitude, longitude: savedLongitude },
				useTTs: savedUseTTs,
				ttsOption,
			});
		} catch (error) {
			console.error('설정을 불러오는 중 오류가 발생했습니다:', error);
		}
	};
	

    const saveSetting = async (key, value) => {
        try {
            if (key === 'ttsOption') {
                await SecureStore.setItemAsync('TTS_Settings', JSON.stringify(value || {}));
            } else {
                const storedValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
                await SecureStore.setItemAsync(`Settings_${key}`, storedValue);
            }

            setSettings((prevSettings) => ({
                ...prevSettings,
                [key]: value,
            }));
        } catch (error) {
            console.error('Failed to save setting:', error);
        }
    };

    const updateLocation = async (latitude, longitude) => {
        try {
            await SecureStore.setItemAsync('Settings_Latitude', latitude.toString());
            await SecureStore.setItemAsync('Settings_Longitude', longitude.toString());

            setSettings((prevSettings) => ({
                ...prevSettings,
                location: { latitude, longitude },
            }));
        } catch (error) {
            console.error('Failed to save location:', error);
        }
    };

    const updateSetting = (key, value) => {
        saveSetting(key, value);
    };

    useEffect(() => {
        console.log('현재 설정 값:', settings);
    }, [settings]);

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, updateLocation }}>
            {children}
        </SettingsContext.Provider>
    );
};

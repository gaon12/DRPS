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
		useOpenStreetMap: false, // Default value for OpenStreetMap usage
	});

	// Function to load settings from SecureStore
	const loadSettings = async () => {
		try {
			const savedDarkMode = await SecureStore.getItemAsync('Settings_DarkMode');
			const savedLanguage = await SecureStore.getItemAsync('Settings_Language');
			const savedNotifications = await SecureStore.getItemAsync('Settings_Notifications');
			const savedWebviewUsage = await SecureStore.getItemAsync('Settings_WebviewUsage');
			const savedUseOpenStreetMap = await SecureStore.getItemAsync('Settings_UseOpenStreetMap');

			setSettings({
				isDarkMode: savedDarkMode === 'Yes',
				language: savedLanguage || 'en',
				notifications: savedNotifications === 'Yes',
				webviewUsage: savedWebviewUsage === 'Yes',
				useOpenStreetMap: savedUseOpenStreetMap === 'Yes', // Load the OpenStreetMap setting
			});
		} catch (error) {
			console.error("Failed to load settings: ", error);
		}
	};

	// Function to save settings to SecureStore
	const saveSetting = async (key, value) => {
		try {
			await SecureStore.setItemAsync(key, value ? 'Yes' : 'No');
			setSettings((prevSettings) => ({
				...prevSettings,
				[key]: value,
			}));
		} catch (error) {
			console.error("Failed to save setting: ", error);
		}
	};

	// Function to update settings
	const updateSetting = (key, value) => {
		saveSetting(key, value);
	};

	// Load settings on app start
	useEffect(() => {
		loadSettings();
	}, []);

	return (
		<SettingsContext.Provider value={{ settings, updateSetting }}>
			{children}
		</SettingsContext.Provider>
	);
};

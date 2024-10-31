import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { List, Switch, IconButton, Divider, Portal, Modal, RadioButton } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import * as Updates from 'expo-updates';
import { SettingsContext } from '../../Context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const languages = {
	ko: '한국어',
	en: 'English',
	ja: '日本語',
	zh: '中文',
};

const SettingsScreen = () => {
	const { settings, updateSetting } = useContext(SettingsContext);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [useWebview, setUseWebview] = useState(false);
	const [enableLabs, setEnableLabs] = useState(false);
	const [buildClickCount, setBuildClickCount] = useState(0);
	const navigation = useNavigation();
	const clickResetInterval = 1000; // 1 second click reset
	const [language, setLanguage] = useState('ko');
	const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);


	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const darkModeValue = await SecureStore.getItemAsync('Settings_DarkMode');
				setIsDarkMode(darkModeValue === 'Yes');
				setUseWebview(settings.webviewUsage); // Context로부터 가져옴
				setEnableLabs(await SecureStore.getItemAsync('Settings_Enable_Labs') === 'Yes');
				const storedLanguage = await SecureStore.getItemAsync('Settings_Language');
				if (storedLanguage) {
					setLanguage(storedLanguage);
				}
			} catch (error) {
				console.error('Error loading settings:', error);
			}
		};

		fetchSettings();
	}, [settings.webviewUsage]);

	const toggleDarkMode = async () => {
		const newDarkMode = !isDarkMode;
		setIsDarkMode(newDarkMode);
		await SecureStore.setItemAsync('Settings_DarkMode', newDarkMode ? 'Yes' : 'No');
		updateSetting('isDarkMode', newDarkMode);
	};

	const changeLanguage = async (newLanguage) => {
		setLanguage(newLanguage);
		setLanguageModalVisible(false); // 언어 선택 후 모달 닫기
		await SecureStore.setItemAsync('Settings_Language', newLanguage);
		updateSetting('language', newLanguage); // Context 업데이트
		Toast.show({
			type: 'success',
			text1: `Language changed to ${languages[newLanguage]}`,
			position: 'top',
		});
	};


	const handleVersionClick = () => {
		navigation.navigate('VersionInfo');
	};

	const handleBuildClick = () => {
		incrementClickCount(setBuildClickCount, buildClickCount, enableLabs, 5, enableLabsFeature);
	};

	const incrementClickCount = (setCount, count, isLabsEnabled, threshold, callback) => {
		if (isLabsEnabled) {
			Toast.show({
				type: 'info',
				text1: 'Labs feature is already enabled.',
				position: 'top',
			});
			return;
		}
		const newCount = count + 1;
		setCount(newCount);

		if (newCount === threshold) {
			callback();
			setCount(0);
		}

		setTimeout(() => setCount(0), clickResetInterval);
	};

	const enableLabsFeature = async () => {
		await SecureStore.setItemAsync('Settings_Enable_Labs', 'Yes');
		setEnableLabs(true);
		Toast.show({
			type: 'success',
			text1: 'Labs feature enabled!',
			position: 'top',
		});
	};

	const handleReset = () => {
		Alert.alert(
			'Reset Settings',
			'Are you sure you want to reset all settings? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Yes',
					onPress: async () => {
						await SecureStore.deleteItemAsync('Settings_DarkMode');
						await SecureStore.deleteItemAsync('Settings_WebviewUsage');
						await SecureStore.deleteItemAsync('Settings_Enable_Labs');
						await Updates.reloadAsync();
					},
				},
			]
		);
	};

	const openURL = async (url) => {
		if (settings.webviewUsage) {	// 웹뷰 사용 설정을 Context에서 가져옴
			await WebBrowser.openBrowserAsync(url);
		} else {
			Linking.openURL(url);
		}
	};

	const iconColor = isDarkMode ? '#ffffff' : '#000000';

	return (
		<SafeAreaView style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<List.Section>
					<Text style={isDarkMode ? styles.darkText : styles.lightText}>Display Settings</Text>
					<List.Item
						title="Light/Dark Mode"
						description="Set light or dark mode"
						left={() => <IconButton icon="theme-light-dark" color={iconColor} />}
						right={() => <Switch value={isDarkMode} onValueChange={toggleDarkMode} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
						descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
					/>
				</List.Section>

				<Divider />

				<List.Section>
					<Text style={isDarkMode ? styles.darkText : styles.lightText}>App Notification</Text>
					<List.Item
						title="Set Notification"
						left={() => <IconButton icon="bell-outline" color={iconColor} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
					<List.Item
						title="Server Uptime Check"
						left={() => <IconButton icon="server" color={iconColor} />}
						onPress={() => openURL('https://www.naver.com')}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
				</List.Section>

				<Divider />

				<List.Section>
					<Text style={isDarkMode ? styles.darkText : styles.lightText}>App Information</Text>
					<TouchableOpacity onPress={handleVersionClick}>
						<List.Item
							title="Version Information"
							description="Version 1.0.0"
							left={() => <IconButton icon="information-outline" color={iconColor} />}
							titleStyle={isDarkMode ? styles.darkText : styles.lightText}
							descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleBuildClick}>
						<List.Item
							title="Build Number"
							description="Build 20240911"
							left={() => <IconButton icon="tools" color={iconColor} />}
							titleStyle={isDarkMode ? styles.darkText : styles.lightText}
							descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
						/>
					</TouchableOpacity>
					{enableLabs && (
						<List.Item
							title="Experimental Features"
							left={() => <IconButton icon="flask" color={iconColor} />}
							onPress={() => navigation.navigate('LabsScreen')}
							titleStyle={isDarkMode ? styles.darkText : styles.lightText}
						/>
					)}
				</List.Section>

				<Divider />

				<List.Section>
					<Text style={isDarkMode ? styles.darkText : styles.lightText}>Other Settings</Text>
					<List.Item
						title="Donation"
						description="Support the project"
						left={() => <IconButton icon="gift-outline" color={iconColor} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
						descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
					/>
					<List.Item
						title="Language"
						left={() => <IconButton icon="ab-testing" color={iconColor} />}
						description={languages[language]}
						onPress={() => setLanguageModalVisible(true)}
					/>
					<Portal>
						<Modal
							visible={isLanguageModalVisible}
							onDismiss={() => setLanguageModalVisible(false)}
							contentContainerStyle={styles.modalContainer}
						>
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>언어 선택</Text>
							<RadioButton.Group onValueChange={changeLanguage} value={language}>
								{Object.entries(languages).map(([key, label]) => (
									<RadioButton.Item key={key} label={label} value={key} />
								))}
							</RadioButton.Group>
						</Modal>
					</Portal>

					<List.Item
						title="GitHub/Discord Links"
						left={() => <IconButton icon="github" color={iconColor} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
					<List.Item
						title="Backup Data"
						left={() => <IconButton icon="backup-restore" color={iconColor} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
					<List.Item
						title="Reset Settings"
						left={() => <IconButton icon="restore" color={iconColor} />}
						onPress={handleReset}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
					<List.Item
						title="Report A Disaster"
						left={() => <IconButton icon="cellphone" color={iconColor} />}
						onPress={() => navigation.navigate('CallScreen')}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
				</List.Section>
			</ScrollView>
			<Toast />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	lightContainer: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	darkContainer: {
		flex: 1,
		backgroundColor: '#1E1E1E',
	},
	scrollContainer: {
		padding: 16,
	},
	lightText: {
		color: '#000000',
		fontSize: 16,
		marginBottom: 8,
	},
	darkText: {
		color: '#ffffff',
		fontSize: 16,
		marginBottom: 8,
	},
	lightDescription: {
		color: '#757575',
	},
	darkDescription: {
		color: '#cfcfcf',
	},
	modalContainer: {
		backgroundColor: 'white', // 모달 배경색 설정
		padding: 20,
		margin: 20,
		borderRadius: 8,
		elevation: 5, // 그림자 효과
	},
});

export default SettingsScreen;

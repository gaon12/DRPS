import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text } from 'react-native';
import { List, Switch, IconButton } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { SettingsContext } from '../../../../Context';

const LabsScreen = () => {
	const { settings, updateSetting } = useContext(SettingsContext);
	const { webviewUsage, isDarkMode, useOpenStreetMap } = settings;

	// Toggle functions for settings
	const toggleWebviewUsage = async () => {
		const newWebviewUsage = !webviewUsage;
		await SecureStore.setItemAsync('Settings_WebviewUsage', newWebviewUsage ? 'Yes' : 'No');
		updateSetting('webviewUsage', newWebviewUsage);
	};

	const toggleOpenStreetMapUsage = async () => {
		const newUseOpenStreetMap = !useOpenStreetMap;
		await SecureStore.setItemAsync('Settings_UseOpenStreetMap', newUseOpenStreetMap ? 'Yes' : 'No');
		updateSetting('useOpenStreetMap', newUseOpenStreetMap);
	};

	return (
		<SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				{/* Webview Settings Section */}
				<List.Section>
					<Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>Webview Settings</Text>
					<List.Item
						title="Webview Usage"
						description="Use in-app browser for links"
						left={() => <IconButton icon="web" color={isDarkMode ? '#FFF' : '#000'} />}
						right={() => <Switch value={webviewUsage} onValueChange={toggleWebviewUsage} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
						descriptionStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
				</List.Section>

				{/* Map Settings Section */}
				<List.Section>
					<Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>Map Settings</Text>
					<List.Item
						title="Use OpenStreetMap"
						description="Use OpenStreetMap; if off, OS default map is used"
						left={() => <IconButton icon="map" color={isDarkMode ? '#FFF' : '#000'} />}
						right={() => <Switch value={useOpenStreetMap} onValueChange={toggleOpenStreetMapUsage} />}
						titleStyle={isDarkMode ? styles.darkText : styles.lightText}
						descriptionStyle={isDarkMode ? styles.darkText : styles.lightText}
					/>
				</List.Section>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	lightContainer: {
		backgroundColor: '#FFFFFF',
	},
	darkContainer: {
		backgroundColor: '#1E1E1E',
	},
	scrollContainer: {
		padding: 16,
	},
	header: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	lightText: {
		color: '#000',
	},
	darkText: {
		color: '#FFF',
	},
});

export default LabsScreen;

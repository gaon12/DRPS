import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './tabs';
import VersionInfo from './tabs/Settings/pages/VersionInfo/index.js';
import LabsScreen from './tabs/Settings/pages/Labs/index.js';
import CheckList from './CheckList';
import { SettingsProvider } from './Context';

const Stack = createStackNavigator();

export default function App() {
	const [isAppReady, setIsAppReady] = React.useState(false);

	useEffect(() => {
		const prepareApp = async () => {
			try {
				await SplashScreen.preventAutoHideAsync();
				const allChecksPassed = await CheckList();
				if (allChecksPassed) {
					setTimeout(() => {
						setIsAppReady(true);
					}, 2000);
				}
			} catch (e) {
				console.warn(e);
			}
		};
		prepareApp();
	}, []);

	const hideSplashScreen = async () => {
		if (isAppReady) {
			await SplashScreen.hideAsync();
		}
	};

	useEffect(() => {
		hideSplashScreen();
	}, [isAppReady]);

	if (!isAppReady) {
		return null;
	}

	return (
		<SettingsProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Tabs">
					{/* Tabs Navigator */}
					<Stack.Screen
						name="Tabs"
						component={Tabs}
						options={{ headerShown: false }}
					/>
					{/* VersionInfo Screen */}
					<Stack.Screen
						name="VersionInfo"
						component={VersionInfo} // 컴포넌트 경로는 import로 해결되고
						options={{ title: 'Version Information' }} // 스크린 이름으로 접근
					/>
					{/* Labs Screen */}
					<Stack.Screen
						name="LabsScreen"
						component={LabsScreen} // 컴포넌트 경로는 import로 해결되고
						options={{ title: 'Labs Screen' }} // 스크린 이름으로 접근
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</SettingsProvider>
	);
}

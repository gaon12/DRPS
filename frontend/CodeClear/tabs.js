import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import your screens
import HomeScreen from './tabs/Home';
import NewsScreen from './tabs/News';
import MapScreen from './tabs/Map';
import SafetyGuideScreen from './tabs/SafetyGuide';
import SettingsScreen from './tabs/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;

					if (route.name === 'Home') {
						iconName = focused ? 'home' : 'home-outline';
					} else if (route.name === 'News') {
						iconName = focused ? 'newspaper' : 'newspaper-outline';
					} else if (route.name === 'Map') {
						iconName = focused ? 'map' : 'map-outline';
					} else if (route.name === 'SafetyGuide') {
						iconName = focused ? 'shield-checkmark' : 'shield-outline';
					} else if (route.name === 'Settings') {
						iconName = focused ? 'settings' : 'settings-outline';
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: 'tomato',
				tabBarInactiveTintColor: 'gray',
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="News" component={NewsScreen} />
			<Tab.Screen name="Map" component={MapScreen} />
			<Tab.Screen name="SafetyGuide" component={SafetyGuideScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
}

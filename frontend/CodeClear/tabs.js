import { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SettingsContext } from './Context'; // Context 불러오기

// 필요한 스크린 가져오기
import HomeScreen from './tabs/Home';
import NewsScreen from './tabs/News';
import MapScreen from './tabs/Map';
import SafetyGuideScreen from './tabs/SafetyGuide';
import SettingsScreen from './tabs/Settings';

const Tab = createBottomTabNavigator();

const Tabs = () => {
		const { settings } = useContext(SettingsContext); // Context에서 설정값 가져오기

		return (
				<Tab.Navigator
						theme={settings.isDarkMode ? DarkTheme : DefaultTheme} // 다크 모드 설정에 따라 테마 적용
						screenOptions={({ route }) => ({
								// 각 탭별로 아이콘 설정
								tabBarIcon: ({ focused, color, size }) => {
										let iconName;

										switch (route.name) {
												case 'Home':
														iconName = focused ? 'home' : 'home-outline';
														break;
												case 'News':
														iconName = focused ? 'newspaper' : 'newspaper-outline';
														break;
												case 'Map':
														iconName = focused ? 'map' : 'map-outline';
														break;
												case 'SafetyGuide':
														iconName = focused ? 'shield-checkmark' : 'shield-outline';
														break;
												case 'Settings':
														iconName = focused ? 'settings' : 'settings-outline';
														break;
										}

										return <Ionicons name={iconName} size={size} color={color} />;
								},
								// 탭 활성화 및 비활성화 시 색상 설정
								tabBarActiveTintColor: 'tomato',
								tabBarInactiveTintColor: 'gray',
								// 탭바 스타일 설정 (다크 모드 여부에 따라 배경 및 경계 색상 설정)
								tabBarStyle: {
										backgroundColor: settings.isDarkMode ? '#121212' : '#fff',
										borderTopColor: settings.isDarkMode ? '#121212' : '#e0e0e0', // 테마에 따른 경계선 색상
								},
						})}
				>
						{/* 각 탭의 스크린 등록 */}
						<Tab.Screen name="Home" component={HomeScreen} />
						<Tab.Screen name="News" component={NewsScreen} />
						<Tab.Screen name="Map" component={MapScreen} />
						<Tab.Screen name="SafetyGuide" component={SafetyGuideScreen} />
						<Tab.Screen name="Settings" component={SettingsScreen} />
				</Tab.Navigator>
		);
};

export default Tabs;

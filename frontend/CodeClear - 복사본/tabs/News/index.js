import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Tab1 from './tabs/DisasterMSG';
import Tab2 from './tabs/News';
import Tab3 from './tabs/Weather';

const Tab = createMaterialTopTabNavigator();

export default function App() {
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarLabelStyle: { fontSize: 12 },
				tabBarStyle: { backgroundColor: '#F0F0F0' },
				tabBarIndicatorStyle: { backgroundColor: 'tomato' },
			}}
		>
			<Tab.Screen name="재난문자" component={Tab1} />
			<Tab.Screen name="뉴스" component={Tab2} />
			<Tab.Screen name="날씨" component={Tab3} />
		</Tab.Navigator>
	);
}

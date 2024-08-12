import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RecoilRoot } from 'recoil';
import Tabs from './tabs';
import SelectLang from './pages/select_lang';
import SplashScreenComponent from './SplashScreenComponent';
import * as SecureStore from 'expo-secure-store';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const checkExit = async () => {
      const isExit = await SecureStore.getItemAsync('IsExit');
      if (isExit === '1') {
        console.log("초기화")
        await SecureStore.setItemAsync('IsExit', '0'); // 'IsExit' 값 초기화
      }
    };

    checkExit();
  }, []);

  return (
    <RecoilRoot>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreenComponent} />
          <Stack.Screen name="SelectLang" component={SelectLang} />
          <Stack.Screen name="Tabs" component={Tabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}

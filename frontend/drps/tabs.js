import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRecoilValue } from 'recoil';
import { langState, themeState } from './atom';
import { translate } from './translations';
import Alert from './tabs/Alert';
import Home from './tabs/Home';
import Resources from './tabs/Resources';
import Settings from './tabs/Settings';
import Tips from './tabs/Tips';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler, ToastAndroid } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

function Tabs() {
  const lang = useRecoilValue(langState);
  const theme = useRecoilValue(themeState);
  const [backPressCount, setBackPressCount] = useState(0);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const checkExit = async () => {
        const isExit = await SecureStore.getItemAsync('IsExit');
        if (isExit === '1') {
          console.log("IsExit값 1");
          await SecureStore.setItemAsync('IsExit', '0');
          navigation.replace('Splash'); // App 화면으로 이동
        }
      };

      const onBackPress = () => {
        if (backPressCount === 1) {
          SecureStore.setItemAsync('IsExit', '1');
          BackHandler.exitApp();
          return true;
        }

        setBackPressCount(backPressCount + 1);
        ToastAndroid.show(`뒤로 가기 버튼을 한 번 더 누르면 종료됩니다 (${2 - backPressCount}번 남음)`, ToastAndroid.SHORT);

        setTimeout(() => {
          setBackPressCount(0);
        }, 2000);

        console.log("종료");

        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      checkExit(); // 포커스될 때 IsExit 값을 체크

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [backPressCount, navigation])
  );

  const screenOptions = ({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName;

      switch (route.name) {
        case 'Home':
          iconName = 'home';
          break;
        case 'Resources':
          iconName = 'book';
          break;
        case 'Tips':
          iconName = 'bulb';
          break;
        case 'Alert':
          iconName = 'notifications';
          break;
        case 'Settings':
          iconName = 'settings';
          break;
        default:
          iconName = 'help';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: theme === 'light' ? '#000' : '#fff',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: {
      backgroundColor: theme === 'light' ? '#fff' : '#000',
    },
    headerShown: false, // 추가된 부분
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ title: translate(lang, 'Home'), headerShown: false }} // 추가된 부분
      />
      <Tab.Screen
        name="Resources"
        component={Resources}
        options={{ title: translate(lang, 'Resources'), headerShown: false }} // 추가된 부분
      />
      <Tab.Screen
        name="Tips"
        component={Tips}
        options={{ title: translate(lang, 'Tips'), headerShown: false }} // 추가된 부분
      />
      <Tab.Screen
        name="Alert"
        component={Alert}
        options={{ title: translate(lang, 'Alert'), headerShown: false }} // 추가된 부분
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ title: translate(lang, 'Settings'), headerShown: false }} // 추가된 부분
      />
    </Tab.Navigator>
  );
}

export default Tabs;

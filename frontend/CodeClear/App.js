import React, {useEffect} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Tabs from './tabs';
import VersionInfo from './tabs/Settings/pages/VersionInfo';
import LabsScreen from './tabs/Settings/pages/Labs/index';
import NewsDetail from './tabs/News/NewsDetail';
import ContributorList from './tabs/Settings/pages/VersionInfo/ContributorList';
import LicenseList from './tabs/Settings/pages/VersionInfo/Opensource';
import NaturalDisasters from './tabs/SafetyGuide/pages/NaturalDisasters';
import SocialDisasters from './tabs/SafetyGuide/pages/SocialDisasters';
import LifeDisasters from './tabs/SafetyGuide/pages/LifeDisasters';
import EmergencyDisasters from './tabs/SafetyGuide/pages/EmergencyDisasters';
import CheckList from './CheckList';
import {SettingsProvider} from './Context';

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
                        options={{headerShown: false}}
                    />
                    {/* VersionInfo Screen */}
                    <Stack.Screen
                        name="LabsScreen"
                        component={LabsScreen} // 컴포넌트 경로는 import로 해결되고
                        options={{title: 'LabsScreen'}} // 스크린 이름으로 접근
                    />
                    {/* Labs Screen */}
                    <Stack.Screen
                        name="VersionInfo"
                        component={VersionInfo} // 컴포넌트 경로는 import로 해결되고
                        options={{title: 'Version Information'}} // 스크린 이름으로 접근
                    />
                    {/* ContributorList Screen */}
                    <Stack.Screen
                        name="ContributorList"
                        component={ContributorList} // 컴포넌트 경로는 import로 해결되고
                        options={{title: 'ContributorList'}} // 스크린 이름으로 접근
                    />
                    {/* LicenseList Screen */}
                    <Stack.Screen
                        name="LicenseList"
                        component={LicenseList} // 컴포넌트 경로는 import로 해결되고
                        options={{title: 'LicenseList'}} // 스크린 이름으로 접근
                    />
                    <Stack.Screen name="NaturalDisasters" component={NaturalDisasters}/>
                    <Stack.Screen name="SocialDisasters" component={SocialDisasters}/>
                    <Stack.Screen name="LifeDisasters" component={LifeDisasters}/>
                    <Stack.Screen name="EmergencyDisasters" component={EmergencyDisasters}/>
                    <Stack.Screen name="NewsDetail" component={NewsDetail} options={{title: 'News Detail'}}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SettingsProvider>
    );
}

import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import CheckList from './CheckList';
import Tabs from './tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import VersionInfo from './tabs/Settings/pages/VersionInfo';
import LabsScreen from './tabs/Settings/pages/Labs/index';
import CallScreen from './tabs/Settings/pages/Emergency/page';
import CprScreen from './tabs/Settings/pages/Emergency/CPRSteps';
import CprPracticeScreen from './tabs/Settings/pages/Emergency/CprPractice';
import NewsDetail from './tabs/News/tabs/News/NewsDetail';
import ContributorList from './tabs/Settings/pages/VersionInfo/ContributorList';
import PatchNotes from './tabs/Settings/pages/VersionInfo/PatchNotes';
import VersionDetails from './tabs/Settings/pages/VersionInfo/PatchNotes/VersionDetails';
import LicenseList from './tabs/Settings/pages/VersionInfo/Opensource';
import NaturalDisasters from './tabs/SafetyGuide/pages/NaturalDisasters';
import SocialDisasters from './tabs/SafetyGuide/pages/SocialDisasters';
import LifeDisasters from './tabs/SafetyGuide/pages/LifeDisasters';
import ApiScreen from './tabs/SafetyGuide/pages/ApiScreen';
import EmergencyDisasters from './tabs/SafetyGuide/pages/EmergencyDisasters';
import SurvivalSkills from './tabs/SafetyGuide/pages/SurvivalSkills';
import CList from './tabs/SafetyGuide/CList';
import ImportantObjects from './tabs/SafetyGuide/CList/ImportantObjects';
import CommonDisasters from './tabs/SafetyGuide/CList/CommonDisasters';
import MyLists from './tabs/SafetyGuide/CList/MyLists';
import EmergencyBags from './tabs/SafetyGuide/CList/EmergencyBags';
import LocalDisasters from './tabs/SafetyGuide/CList/LocalDisasters';
import EvacMain from './tabs/SafetyGuide/EvacSimulator/EvacMain'
import EvacwithAddress from './tabs/SafetyGuide/EvacSimulator/EvacwithAddress'
import EvacwithMap from './tabs/SafetyGuide/EvacSimulator/EvacwithMap'
import ExamplePage from './tabs/SafetyGuide/CList/ExamplePage'
import { SettingsProvider } from './Context';

const Stack = createStackNavigator();

const App = () => {
	const [isAppReady, setIsAppReady] = React.useState(false);

	useEffect(() => {
		const prepareApp = async () => {
			try {
				// 스플래시 화면 자동 숨김 방지
				await SplashScreen.preventAutoHideAsync();

				// 필수 체크리스트를 모두 통과했는지 확인
				const allChecksPassed = await CheckList();

				if (allChecksPassed) {
					// 2초 후에 앱을 준비 상태로 전환
					setTimeout(() => {
						setIsAppReady(true);
					}, 2000);
				}
			} catch (e) {
				console.warn(e); // 에러 발생 시 경고 출력
			}
		};
		prepareApp(); // 앱 준비 작업 실행
	}, []);

	// 앱 준비 완료 시 스플래시 화면 숨김 처리
	useEffect(() => {
		const hideSplashScreen = async () => {
			if (isAppReady) {
				await SplashScreen.hideAsync();
			}
		};
		hideSplashScreen(); // 스플래시 화면 숨기기
	}, [isAppReady]);

	// 앱이 준비되지 않았다면 아무것도 렌더링하지 않음
	if (!isAppReady) {
		return null;
	}

	return (
		<SettingsProvider>
			<PaperProvider>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Tabs">
						{/* 하단 탭 네비게이터 */}
						<Stack.Screen
							name="Tabs"
							component={Tabs}
							options={{ headerShown: false }} // 상단 헤더 숨기기
						/>
						{/* 실험실 화면 */}
						<Stack.Screen
							name="LabsScreen"
							component={LabsScreen}
							options={{ title: 'Labs Screen' }} // 상단 타이틀 설정
						/>
						{/* 재난 신고 화면 */}
						<Stack.Screen
							name="CallScreen"
							component={CallScreen}
							options={{ title: 'Calls Screen' }} // 상단 타이틀 설정
						/>
						{/* 심폐소생술 화면 */}
						<Stack.Screen
							name="CprScreen"
							component={CprScreen}
							options={{ title: 'Cprs Screen' }} // 상단 타이틀 설정
						/>
						{/* 심폐소생술 실습 화면 */}
						<Stack.Screen
							name="CprPracticeScreen"
							component={CprPracticeScreen}
							options={{ title: 'Cprs Pratice Screen' }} // 상단 타이틀 설정
						/>
						{/* 버전 정보 화면 */}
						<Stack.Screen
							name="VersionInfo"
							component={VersionInfo}
							options={{ title: 'Version Information' }}
						/>
						{/* 기여자 목록 화면 */}
						<Stack.Screen
							name="ContributorList"
							component={ContributorList}
							options={{ title: 'Contributor List' }}
						/>
						{/* 오픈소스 라이센스 목록 화면 */}
						<Stack.Screen
							name="LicenseList"
							component={LicenseList}
							options={{ title: 'License List' }}
						/>
						{/* 패치 노트 목록 화면 */}
						<Stack.Screen
							name="PatchNotes"
							component={PatchNotes}
							options={{ title: 'Patch Notes' }}
						/>
						{/* 특정 버전 세부 정보 화면 */}
						<Stack.Screen
							name="VersionDetails"
							component={VersionDetails}
							options={{ title: 'Version Details' }}
						/>
						{/* 재난 유형 화면 (자연 재난, 사회 재난 등) */}
						<Stack.Screen name="NaturalDisasters" component={NaturalDisasters} />
						<Stack.Screen name="SocialDisasters" component={SocialDisasters} />
						<Stack.Screen name="LifeDisasters" component={LifeDisasters} />
						<Stack.Screen name="EmergencyDisasters" component={EmergencyDisasters} />
						<Stack.Screen name="SurvivalSkills" component={SurvivalSkills} />
						<Stack.Screen name="ApiScreen" component={ApiScreen} />
						{/* 뉴스 상세 화면 */}
						<Stack.Screen
							name="NewsDetail"
							component={NewsDetail}
							options={{ title: 'News Detail' }}
						/>
						{/* 체크리스트와 피난시뮬레이션 */}
						<Stack.Screen name="CList" component={CList} />
						<Stack.Screen name="EvacMain" component={EvacMain} />

						{/* 체크리스트 관련 */}
						<Stack.Screen name="ImportantObjects" component={ImportantObjects} />
						<Stack.Screen name="CommonDisasters" component={CommonDisasters} />
						<Stack.Screen name="MyLists" component={MyLists} />
						<Stack.Screen name="EmergencyBags" component={EmergencyBags} />
						<Stack.Screen name="LocalDisasters" component={LocalDisasters} />

						{/* 피난시뮬레이션 관련 */}
						<Stack.Screen name="EvacwithAddress" component={EvacwithAddress} />
						<Stack.Screen name="EvacwithMap" component={EvacwithMap} />

						<Stack.Screen name="ExamplePage" component={ExamplePage} />

					</Stack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</SettingsProvider>
	);
};

export default App;

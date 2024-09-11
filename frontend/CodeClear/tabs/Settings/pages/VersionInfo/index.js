import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { SettingsContext } from '../../../../Context';

const VersionInfo = () => {
    const [latestVersion, setLatestVersion] = useState('');
    const currentVersion = '0.1.0';
    const navigation = useNavigation();
    const { settings } = useContext(SettingsContext);
    const isDarkMode = settings.isDarkMode;

    // 서버에서 최신 버전 정보 가져오기
    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const response = await axios.get('https://apis.uiharu.dev/drps/version.php');
                setLatestVersion(response.data.LatestVersion);
            } catch (error) {
                console.error('Error fetching version data:', error);
            }
        };

        fetchLatestVersion();
    }, []);

    // 버전 비교 함수, useMemo로 메모이제이션
    const versionStatus = useMemo(() => {
        if (!latestVersion) return '';
        if (currentVersion === latestVersion) {
            return '최신 버전입니다.';
        }
        if (currentVersion < latestVersion) {
            return '최신 버전으로 업데이트가 필요합니다.';
        }
        return '베타 버전을 사용하고 있습니다.';
    }, [currentVersion, latestVersion]);

    return (
        <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            <View style={styles.contentWrapper}>
                <Text style={[styles.mainTitle, isDarkMode ? styles.darkText : styles.lightText]}>CODE: CLEAR</Text>
                <Text style={[styles.versionInfo, isDarkMode ? styles.darkText : styles.lightText]}>버전: {currentVersion}</Text>
                {versionStatus && (
                    <Text style={[
                        styles.versionStatus,
                        isDarkMode ? styles.darkText : styles.lightText,
                        versionStatus.includes('업데이트') && styles.updateNeeded
                    ]}>
                        {versionStatus}
                    </Text>
                )}
            </View>

            <View style={styles.buttonWrapper}>
                <Divider style={styles.divider} />
                <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}>
                    <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>이용약관</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => navigation.navigate('LicenseList')}>
                    <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>오픈소스 라이센스</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => navigation.navigate('ContributorList')}>
                    <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>기여자 목록</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lightContainer: {
        backgroundColor: '#F7F8FA',
    },
    darkContainer: {
        backgroundColor: '#1E1E1E',
    },
    contentWrapper: {
        alignItems: 'center',
        marginTop: 100,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    lightText: {
        color: '#111',
    },
    darkText: {
        color: '#EEE',
    },
    versionInfo: {
        fontSize: 16,
        marginBottom: 4,
    },
    versionStatus: {
        fontSize: 14,
        marginBottom: 24,
    },
    updateNeeded: {
        color: 'red',
        fontWeight: 'bold',
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    lightButton: {
        backgroundColor: '#EDEDED',
    },
    darkButton: {
        backgroundColor: '#333',
    },
    lightButtonText: {
        fontSize: 16,
        color: '#555',
    },
    darkButtonText: {
        fontSize: 16,
        color: '#EEE',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginBottom: 16,
    },
});

export default VersionInfo;

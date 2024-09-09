import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Divider } from 'react-native-paper';
import axios from 'axios';

const VersionInfo = () => {
    const [latestVersion, setLatestVersion] = useState('');
    const [versionStatus, setVersionStatus] = useState('');
    const currentVersion = '0.1.0';

    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const response = await axios.get('https://apis.uiharu.dev/drps/version.php');
                const serverVersion = response.data.LatestVersion;
                setLatestVersion(serverVersion);
                compareVersions(currentVersion, serverVersion);
            } catch (error) {
                console.error('Error fetching version data:', error);
            }
        };

        const compareVersions = (appVersion, serverVersion) => {
            if (appVersion === serverVersion) {
                setVersionStatus('최신 버전입니다.');
            } else if (appVersion < serverVersion) {
                setVersionStatus('최신 버전으로 업데이트가 필요합니다.');
            } else {
                setVersionStatus('베타 버전을 사용하고 있습니다.');
            }
        };

        fetchLatestVersion();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                <Text style={styles.mainTitle}>갤러리</Text>
                <Text style={styles.versionInfo}>버전: {currentVersion}</Text>
                {latestVersion && (
                    <Text style={[
                        styles.versionStatus,
                        versionStatus.includes('업데이트') && styles.updateNeeded
                    ]}>
                        {versionStatus}
                    </Text>
                )}
            </View>

            <View style={styles.buttonWrapper}>
                <View style={styles.dividerWrapper}>
                    <Divider style={styles.divider} />
                </View>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>이용약관</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>오픈소스 라이센스</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>기여자 목록</Text>
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
        backgroundColor: '#F7F8FA',
    },
    contentWrapper: {
        alignItems: 'center',
        marginTop: 100,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    versionInfo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    versionStatus: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    updateNeeded: {
        color: 'red',
        fontWeight: 'bold',
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20, // Align buttons towards the bottom
    },
    dividerWrapper: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
    },
    button: {
        backgroundColor: '#EDEDED',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 16,
        color: '#555',
    },
});

export default VersionInfo;

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Share } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';
import { SettingsContext } from '../../../../Context';
import * as SecureStore from 'expo-secure-store';

const NewsDetail = () => {
	const route = useRoute();
	const { yna_no } = route.params;
	const [newsData, setNewsData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [settingsLang, setSettingsLang] = useState('ko');
	const { settings } = useContext(SettingsContext);
	const isDarkMode = settings.isDarkMode;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const lang = await SecureStore.getItemAsync('Settings_Language') || 'ko';
				setSettingsLang(lang);

				const response = await axios.get(`https://apis.uiharu.dev/drps/news/api.php`, {
					params: { yna_no },
				});
				if (response.data.StatusCode === 200) {
					let cleanedData = cleanContent(response.data.data[0]);
					if (lang !== 'ko') {
						cleanedData = await translateContent(cleanedData);
					}
					setNewsData(cleanedData);
				} else {
					throw new Error('Failed to fetch news data');
				}
			} catch (err) {
				setError('뉴스 데이터를 가져오는데 실패했습니다.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [yna_no]);

	// 텍스트 클리닝 기능
	const cleanContent = (data) => {
		const { yna_cn, yna_ttl } = data;
		const cleanedContent = yna_cn
			.split('\n')
			.filter((line, index) => (
				!(index === 0 && line.trim() === yna_ttl.trim()) &&
				!/^[^\s]+\s*=\s*연합뉴스/.test(line) &&
				!/\s*기자\s*=\s*/.test(line) &&
				!line.includes('(끝)') &&
				!line.includes('@')
			))
			.map(line => line.replace(/\s{2,}/g, ' ').trim())
			.filter(line => line !== '');

		data.yna_cn = cleanedContent.join('\n');
		return data;
	};

	// 텍스트 번역 기능
	const translateContent = async (data) => {
		try {
			const response = await axios.post('https://apis.uiharu.dev/trans/api2.php', {
				transSentence: `${data.yna_ttl}\n${data.yna_cn}`,
				originLang: 'ko',
				targetLang: settingsLang,
			});
			if (response.data.StatusCode === 200) {
				const [translatedTitle, ...translatedContent] = response.data.translatedText.split('\n');
				data.yna_ttl = translatedTitle;
				data.yna_cn = translatedContent.join('\n');
			}
		} catch (error) {
			console.error('Translation failed:', error);
		}
		return data;
	};

	// 공유 기능
	const handleShare = async () => {
		if (newsData) {
			try {
				await Share.share({
					message: `${newsData.yna_ttl}\n\n${newsData.yna_cn}`,
				});
			} catch (error) {
				console.log('Sharing failed:', error);
			}
		}
	};

	// TTS 기능
	const handleTTS = () => {
		if (isSpeaking) {
			Speech.stop();
			setIsSpeaking(false);
		} else {
			Speech.speak(newsData.yna_cn, { language: settingsLang });
			setIsSpeaking(true);
		}
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	if (!newsData) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>뉴스 데이터를 찾을 수 없습니다.</Text>
			</View>
		);
	}

	// 기사 내용 부분에서 1줄 줄바꿈을 2줄 줄바꿈으로 변환하는 함수
	const formatContentWithDoubleLineBreaks = (content) => content.replace(/\n/g, '\n\n');

	return (
		<ScrollView contentContainerStyle={isDarkMode ? darkStyles.container : styles.container} style={isDarkMode ? darkStyles.scrollView : styles.scrollView}>
			<Text style={isDarkMode ? darkStyles.title : styles.title}>{newsData.yna_ttl}</Text>
			<View style={isDarkMode ? darkStyles.metaContainer : styles.metaContainer}>
				<Text style={isDarkMode ? darkStyles.subtitle : styles.subtitle}>
					{newsData.yna_reg_ymd} | {newsData.team_nm}
				</Text>
				<View style={styles.iconContainer}>
					<TouchableOpacity onPress={handleShare} style={styles.iconButton}>
						<MaterialIcons name="share" size={20} color={isDarkMode ? '#fff' : 'black'} />
					</TouchableOpacity>
					<TouchableOpacity onPress={handleTTS} style={styles.iconButton}>
						<MaterialIcons name={isSpeaking ? 'volume-off' : 'volume-up'} size={20} color={isDarkMode ? '#fff' : 'black'} />
					</TouchableOpacity>
				</View>
			</View>

			<Text style={isDarkMode ? darkStyles.body : styles.body}>
				{formatContentWithDoubleLineBreaks(newsData.yna_cn)}
			</Text>
		</ScrollView>
	);
};

const baseStyles = {
	container: {
		padding: 20,
		backgroundColor: 'white',
	},
	scrollView: {
		backgroundColor: 'white',
	},
	title: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
	},
	metaContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	subtitle: {
		fontSize: 16,
		color: '#888',
	},
	iconContainer: {
		flexDirection: 'row',
	},
	iconButton: {
		marginHorizontal: 8,
	},
	body: {
		fontSize: 20,
		lineHeight: 26,
		color: '#444',
		marginBottom: 20,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		color: 'red',
		fontSize: 16,
	},
};

const darkStyles = StyleSheet.create({
	...baseStyles,
	container: {
		...baseStyles.container,
		backgroundColor: '#1E1E1E',
	},
	scrollView: {
		...baseStyles.scrollView,
		backgroundColor: '#1E1E1E',
	},
	title: {
		...baseStyles.title,
		color: '#fff',
	},
	subtitle: {
		...baseStyles.subtitle,
		color: '#ccc',
	},
	body: {
		...baseStyles.body,
		color: '#ddd',
	},
});

const styles = StyleSheet.create(baseStyles);

export default NewsDetail;

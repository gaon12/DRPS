import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View, Linking, TouchableOpacity } from 'react-native';
import { Card, Title, Avatar, List } from 'react-native-paper';
import { SettingsContext } from '../../../../../Context'; // Context 불러오기

// contributors.json 파일을 불러옵니다.
const contributors = require('./contributors.json');

// 정적 이미지 경로 미리 require로 불러오기
const avatarImages = {
	andyou: require('./imgs/andyou.png'),
};

const ContributorList = () => {
	const { settings } = useContext(SettingsContext);
	const isDarkMode = settings.isDarkMode;

	const handlePress = (url) => {
		Linking.openURL(url);
	};

	// avatarUrl이 http로 시작하면 외부 이미지를 사용하고, 그렇지 않으면 로컬 이미지를 사용
	const getAvatarSource = (avatarUrl) => {
		if (avatarUrl.startsWith('http')) {
			return { uri: avatarUrl }; // 외부 이미지 URL
		} else {
			// 동적 경로 대신 미리 require한 정적 이미지를 매핑하여 반환
			return avatarImages[avatarUrl] || require('./imgs/default-avatar.png');
		}
	};

	return (
		<View style={[styles.container, isDarkMode && styles.darkContainer]}>
			<ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.darkBackground]}>
				{Object.keys(contributors).map((category, index) => (
					<View key={index}>
						<List.Section>
							<List.Subheader style={[styles.subheader, isDarkMode && styles.darkText]}>{category}</List.Subheader>
						</List.Section>
						{contributors[category].map((contributor, idx) => (
							<Card key={idx} style={[styles.card, isDarkMode && styles.darkCard]}>
								<Card.Title
									title={
										contributor.github ? (
											<TouchableOpacity onPress={() => handlePress(contributor.github)}>
												<Title style={[styles.title, styles.link, isDarkMode && styles.darkText]}>{contributor.name}</Title>
											</TouchableOpacity>
										) : (
											<Title style={[styles.title, isDarkMode && styles.darkText]}>{contributor.name}</Title>
										)
									}
									subtitle={contributor.role}
									left={() => (
										<Avatar.Image
											size={48}
											source={getAvatarSource(contributor.avatarUrl)} // avatarUrl에 따라 이미지 결정
										/>
									)}
									titleStyle={[styles.title, isDarkMode && styles.darkText]}
									subtitleStyle={[styles.subtitle, isDarkMode && styles.darkSubtitle]}
								/>
							</Card>
						))}
					</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f2f2f2',
	},
	darkContainer: {
		backgroundColor: '#1E1E1E',
	},
	scrollContainer: {
		padding: 15,
		paddingBottom: 30,
	},
	darkBackground: {
		backgroundColor: '#1E1E1E',
	},
	subheader: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#444',
		marginTop: 16,
		marginBottom: 8,
	},
	darkText: {
		color: '#ffffff',
	},
	card: {
		marginVertical: 10,
		borderRadius: 16,
		elevation: 4,
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		paddingHorizontal: 10,
	},
	darkCard: {
		backgroundColor: '#1e1e1e',
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	subtitle: {
		fontSize: 14,
		color: '#777',
	},
	darkSubtitle: {
		color: '#aaaaaa',
	},
	link: {
		color: '#1e90ff',
		textDecorationLine: 'none',
	},
});

export default ContributorList;

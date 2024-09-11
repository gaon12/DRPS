import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Card, Button, Paragraph, Title } from 'react-native-paper';
import axios from 'axios';

const NewsList = ({ navigation }) => {
	const [newsData, setNewsData] = useState([]);
	const [pageNo, setPageNo] = useState(1);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false); // 리프레시 상태 추가

	const fetchNewsData = async (pageNo, isRefresh = false) => {
		if (isRefresh) {
			setRefreshing(true); // 리프레시 상태를 true로 설정
		} else {
			setLoading(true); // 로딩 상태를 true로 설정
		}
		try {
			const response = await axios.get(`https://apis.uiharu.dev/drps/news/api.php?pageNo=${pageNo}`);
			if (response.data.StatusCode === 200) {
				if (isRefresh) {
					setNewsData(response.data.data); // 리프레시 시 데이터를 덮어씀
				} else {
					setNewsData((prevNews) => [...prevNews, ...response.data.data]); // 기존 데이터에 추가
				}
			}
		} catch (error) {
			console.error('Error fetching news data:', error);
		} finally {
			if (isRefresh) {
				setRefreshing(false); // 리프레시가 완료되면 상태를 false로 설정
			} else {
				setLoading(false); // 로딩이 완료되면 상태를 false로 설정
			}
		}
	};

	useEffect(() => {
		fetchNewsData(pageNo);
	}, [pageNo]);

	const loadMoreNews = () => {
		if (!loading) {
			setPageNo((prevPageNo) => prevPageNo + 1);
		}
	};

	const onRefresh = () => {
		setPageNo(1); // 첫 페이지로 리셋
		fetchNewsData(1, true); // 첫 페이지의 데이터를 다시 로드
	};

	// 첫 번째 줄 제거 + 공백 2개 이상을 1개로 치환
	const removeFirstLineAndExtraSpaces = (text) => {
		const lines = text.split('\n');
		const remainingText = lines.slice(1).join(' ').replace(/\s+/g, ' '); // 공백 2개 이상을 1개로 치환
		return remainingText;
	};

	const renderItem = ({ item }) => (
		<Card style={styles.card}>
			<Card.Content>
				<Title style={styles.title}>
					{item.yna_ttl.replace(/\n/g, ' ').length > 50 ? `${item.yna_ttl.replace(/\n/g, ' ').slice(0, 50)}...` : item.yna_ttl.replace(/\n/g, ' ')}
				</Title>
				<Paragraph>
					<Text style={styles.contentPreview}>
						{removeFirstLineAndExtraSpaces(item.yna_cn).length > 100 ? `${removeFirstLineAndExtraSpaces(item.yna_cn).slice(0, 100)}...` : removeFirstLineAndExtraSpaces(item.yna_cn)}
					</Text>
				</Paragraph>
			</Card.Content>
			<Card.Actions>
				<Button
					mode="contained"
					onPress={() => navigation.navigate('NewsDetail', { yna_no: item.yna_no })}
					labelStyle={styles.buttonText}
					style={styles.button}
				>
					Read More
				</Button>
			</Card.Actions>
		</Card>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={newsData}
				renderItem={renderItem}
				keyExtractor={(item, index) => `${item.yna_no}-${index}`}
				onEndReached={loadMoreNews}
				onEndReachedThreshold={0.5}
				ListFooterComponent={loading && <ActivityIndicator size="large" color="#0000ff" />}
				refreshing={refreshing} // 리프레시 상태
				onRefresh={onRefresh} // 리프레시 시 호출될 함수
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: '#fcfafb',
	},
	card: {
		marginBottom: 10,
		borderRadius: 15,
		backgroundColor: '#fff5f7',
		marginHorizontal: 10,
	},
	title: {
		fontWeight: 'bold',
		fontSize: 18, // 글자 크기 키움
		color: '#ff6f91',
	},
	contentPreview: {
		fontStyle: 'italic',
		color: '#333',
		paddingVertical: 5,
	},
	button: {
		borderRadius: 20,
		backgroundColor: '#ff6f91',
	},
	buttonText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#fff',
	},
});

export default NewsList;

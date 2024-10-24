import React, { useState, useEffect, useContext } from "react";
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import axios from "axios";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SettingsContext } from "../../../../Context";
import { Button } from "react-native-paper";
import { cleanContent } from "./hooks/cleanContent";

const NewsList = ({ navigation }) => {
	const [newsData, setNewsData] = useState([]);
	const [pageNo, setPageNo] = useState(1);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchText, setSearchText] = useState(""); // 검색어 상태
	const { settings } = useContext(SettingsContext);
	const isDarkMode = settings.isDarkMode;

	// 뉴스 데이터 가져오기
	const fetchNewsData = async (pageNo, isRefresh = false, title = "") => {
		try {
			isRefresh ? setRefreshing(true) : setLoading(true);
	
			// 인코딩 없이 요청 URL 생성
			const requestUrl = `https://apis.uiharu.dev/drps/news/api.php?pageNo=${pageNo}&title=${title}`;
			console.log("Requesting URL (without encoding):", requestUrl);
	
			const response = await axios.get(requestUrl);
	
			console.log("API Response:", response.data);
	
			if (response.data.StatusCode === 200) {
				const cleanedData = response.data.data.map(cleanContent);
				setNewsData(prevNews =>
					isRefresh ? cleanedData : [...prevNews, ...cleanedData]
				);
			} else {
				console.warn("No news data found.");
				setNewsData([]);
			}
		} catch (error) {
			console.error("Error fetching news data:", error);
			setNewsData([]);
		} finally {
			isRefresh ? setRefreshing(false) : setLoading(false);
		}
	};

	useEffect(() => {
		fetchNewsData(pageNo, false, searchText);
	}, [pageNo]);

	const loadMoreNews = () => {
		if (!loading && !refreshing) {
			setPageNo(prevPageNo => prevPageNo + 1);
		}
	};

	const handleSearch = () => {
		setPageNo(1);  // 페이지 번호 초기화
		setNewsData([]); // 기존 뉴스 데이터 초기화
		fetchNewsData(1, false, searchText); // 새로운 검색어로 데이터 가져오기
	};

	const onRefresh = () => {
		setPageNo(1);
		fetchNewsData(1, true);
	};

	const renderHeader = () => (
		<View style={styles.container}>
		<View style={styles.searchBar}>
			<View style={styles.searchInputContainer}>
				<Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
				<TextInput
					style={styles.searchInput}
					placeholder="지역 또는 키워드로 검색"
					value={searchText}
					onChangeText={setSearchText}
					onSubmitEditing={handleSearch} // 엔터키로도 검색 가능하도록
				/>
			</View>
			<TouchableOpacity
				style={styles.searchButton}
				onPress={handleSearch}
			>
				<Ionicons name="search" size={20} color="white" />
			</TouchableOpacity>
			<TouchableOpacity style={styles.filterButton}>
				<MaterialIcons name="filter-list" size={20} color="black" />
			</TouchableOpacity>
		</View>
		</View>
	);

	const renderItem = ({ item, index }) => {
		const fullText = item.formattedContent
			.map(contentBlock => contentBlock.text)
			.join(" ")
			.replace(/\n/g, " ")
			.replace(/\s{2,}/g, " ");

		const previewText = fullText.length > 80 ? `${fullText.slice(0, 80)}...` : fullText;

		return (
			<>
				<TouchableOpacity
					onPress={() => navigation.navigate("NewsDetail", { yna_no: item.yna_no })}
					style={styles.articleContainer}
				>
					<Text style={[styles.title, isDarkMode && styles.titleDark]}>
						{item.yna_ttl.length > 30 ? `${item.yna_ttl.slice(0, 30)}...` : item.yna_ttl}
					</Text>
					<View style={styles.dateContainer}>
						<MaterialCommunityIcons
							name="clock-outline"
							size={14}
							color={isDarkMode ? "#aaa" : "#666"}
						/>
						<Text style={[styles.date, isDarkMode && styles.dateDark]}>{item.crt_dt}</Text>
					</View>
					<Text style={[styles.excerpt, isDarkMode && styles.excerptDark]}>{previewText}</Text>
					<View style={styles.buttonContainer}>
						<Button
							mode="text"
							onPress={() => navigation.navigate("NewsDetail", { yna_no: item.yna_no })}
							contentStyle={styles.buttonContent}
							labelStyle={[styles.buttonText, isDarkMode && styles.buttonTextDark]}
						>
							자세히 보기
						</Button>
						<MaterialIcons
							name="arrow-forward"
							size={16}
							style={[styles.icon, isDarkMode && styles.iconDark]}
						/>
					</View>
					{index < newsData.length - 1 && <View style={styles.separator} />}
				</TouchableOpacity>
			</>
		);
	};

	return (
		<View style={[styles.container, isDarkMode && styles.containerDark]}>
			{renderHeader()}
			<FlatList
				data={newsData}
				renderItem={renderItem}
				keyExtractor={(item, index) => `${item.yna_no}-${index}`}
				onEndReached={loadMoreNews}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					loading && (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#000"} />
						</View>
					)
				}
				refreshing={refreshing}
				onRefresh={onRefresh}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f9fa"
	},
	containerDark: {
		backgroundColor: "#1E1E1E"
	},
	articleContainer: {
		padding:15,
		paddingVertical: 10
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
		color: "#000"
	},
	titleDark: {
		color: "#fff"
	},
	dateContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginBottom: 8
	},
	date: {
		fontSize: 12,
		color: "#666",
		marginLeft: 4
	},
	dateDark: {
		color: "#ccc"
	},
	excerpt: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8
	},
	excerptDark: {
		color: "#ccc"
	},
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center"
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center"
	},
	buttonText: {
		fontSize: 14,
		fontWeight: "bold",
		marginRight: 4,
		color: "#000"
	},
	buttonTextDark: {
		color: "#fff"
	},
	icon: {
		marginTop: 1
	},
	iconDark: {
		color: "#ccc"
	},
	separator: {
		marginTop: 16,
		borderBottomColor: "#ddd",
		borderBottomWidth: 1
	},
	loadingContainer: {
		padding: 10,
		justifyContent: "center",
		alignItems: "center"
	},
	searchBar: {
		flexDirection: "row",
		margin: 16,
		alignItems: "center"
	},
	searchInputContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "#ffffff",
		borderRadius: 50,
		paddingLeft: 12,
		marginRight: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center"
	},
	searchIcon: {
		marginRight: 8
	},
	searchInput: {
		flex: 1,
		height: 40,
	},
	searchButton: {
		backgroundColor: "#1e90ff",
		borderRadius: 50,
		padding: 8
	},
	filterButton: {
		backgroundColor: "#e0e0e0",
		borderRadius: 50,
		padding: 8,
		marginLeft: 8
	},
});

export default NewsList;
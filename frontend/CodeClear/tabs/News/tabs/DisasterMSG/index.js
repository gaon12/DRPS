import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Linking, text } from "react-native";
import { Modal, Portal, Button, Provider } from "react-native-paper";
import axios from "axios";
import * as WebBrowser from 'expo-web-browser';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import DropDownPicker from 'react-native-dropdown-picker';
import { handleShare } from "../News/hooks/handleShare.js";
import disasterCategories from './disasterCategories.js';
import regions from './regions.js';
import { SettingsContext } from '../../../../Context';

export default function DisasterAlerts() {
	const [searchTerm, setSearchTerm] = useState("");
	const [alerts, setAlerts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [page, setPage] = useState(1);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [selectedRegion, setSelectedRegion] = useState("전국");
	const [selectedDate, setSelectedDate] = useState("");
	const [showCalendar, setShowCalendar] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [regionMenuVisible, setRegionMenuVisible] = useState(false);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(selectedRegion);
	const [items, setItems] = useState(regions.map(region => ({ label: region, value: region })));
	const [apiError, setApiError] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedAlert, setSelectedAlert] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [openCategoryPicker, setOpenCategoryPicker] = useState(false);
	const { settings } = useContext(SettingsContext); // 웹뷰 사용 설정 가져오기
	
	const handleRefresh = async () => {
		try {
			if (isLoading) return;
			setIsRefreshing(true);
			setHasMore(true);
			await fetchAlerts(1, true);
		} catch (error) {
			console.error('새로고침 중 오류 발생:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading) {
			const nextPage = page + 1;
			setPage(nextPage);
		}
	};

	const fetchAlerts = async (requestedPage = page, isRefresh = false) => {
		if (isLoading || !hasMore) return;
		setIsLoading(true);
		setApiError(false);

		const cleanString = (str) => str.replace(/\s+/g, '').trim();
		const isRegion = regions.some(region => cleanString(region).includes(cleanString(searchTerm)));
		const isCategory = disasterCategories.some(category => cleanString(category.label).includes(cleanString(searchTerm)));

		const requestData = {
			pageNo: requestedPage,
			numOfRows: 10,
			region_name: isRegion ? searchTerm.trim() : undefined,
			text: !isRegion && !isCategory ? searchTerm.trim() : undefined,
			disaster_type: isCategory ? searchTerm.trim() : selectedCategory || undefined, // 카테고리 필터 추가
			created_at: selectedDate || undefined,
		};

		try {
			const response = await axios.get(`https://apis.uiharu.dev/drps/disaster_msg/api.php`, {
				params: requestData,
			});

			const data = response.data.data;

			if (data.length < 10) setHasMore(false);

			setAlerts((prevAlerts) => {
				const newAlerts = isRefresh ? data : [...prevAlerts, ...data];
				return newAlerts.filter(
					(alert, index, self) =>
						index === self.findIndex((a) => a.serial_number === alert.serial_number)
				);
			});

		} catch (error) {
			console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
			setApiError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAlerts(page);
		console.log("현재 웹뷰 설정 값:", settings.webviewUsage);
	}, [page, settings.webviewUsage]);


	const formatAlertDetails = (alert) => {
		const formattedDate = new Date(alert.created_at).toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS 형식
		return `${formattedDate} / ${formatArea(alert.disaster_type)}`; // 발생일 / 분류 형식
	};

	const handleAlertPress = (alert) => {
		setSelectedAlert({
			...alert,
			formattedDetails: formatAlertDetails(alert) // 포맷된 데이터 추가
		});
		setIsDetailModalOpen(true);
	};

	const resetModalValues = () => {
		setSelectedRegion("전국");
		setSelectedDate("");
		setValue("전국");
	};


	const handleSearch = () => {
		setPage(1);
		setAlerts([]);
		setHasMore(true);
		fetchAlerts(1);
	};


	const sortedCategories = [...disasterCategories]
		.sort((a, b) => a.label.localeCompare(b.label, 'ko')) // 가나다순 정렬
		.filter((item) => item.label !== "기타"); // "기타" 제외
	sortedCategories.push({ label: "기타", value: "기타" }); // "기타"를 맨 아래로 추가


	const extractAndDisplayLinks = (text) => {

	
		const cleanText = (text || "").replace(/\\/g, '/'); // 역슬래시를 슬래시로 변환합니다.
		const urlRegex = /(\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?\b)/gi;
		const parts = cleanText.split(urlRegex);
	
		const openLink = async (url) => {
			const formattedLink = url.startsWith('http') ? url : `https://${url}`;
		
			// 명확한 boolean 비교로 로직 개선
			if (settings.webviewUsage === true) {
				try {
					await WebBrowser.openBrowserAsync(formattedLink); // 웹뷰로 링크 열기
				} catch (error) {
					console.error("웹뷰 열기 실패:", error);
				}
			} else {
				try {
					await Linking.openURL(formattedLink); // 기본 브라우저로 링크 열기
				} catch (error) {
					console.error("브라우저 열기 실패:", error);
				}
			}
		};
	
		return parts.map((part, index) => {
			if (urlRegex.test(part)) {
				return (
					<Text
						key={index}
						style={styles.MessageModallinkText}
						onPress={() => openLink(part)}
					>
						{part}
					</Text>
				);
			}
			return <Text key={index} style={{ color: "#333" }}>{part}</Text>;
		});
	};

	const handleFilterApply = () => {
		setIsFilterModalOpen(false);
		setShowCalendar(false);

		// 필터값 적용 및 상태 초기화
		setAlerts([]);   // 알림 리스트 초기화
		setPage(1);      // 페이지 초기화
		setHasMore(true); // 더 많은 데이터가 있다고 설정

		// 선택된 필터 값 설정
		setSelectedRegion(value);
		setSelectedCategory(selectedCategory);
		setSelectedDate(selectedDate);

		// 필터가 적용된 상태로 데이터 요청
		fetchAlerts(1, true); // 첫 페이지에서 리프레시 모드로 데이터 요청
	};

	const formatRegions = region => {
		const regionList = region.split(",").map(item => item.trim());
		const uniqueRegions = [...new Set(regionList)];

		if (uniqueRegions.length <= 2) {
			const mainDivision = uniqueRegions.map(r => r.split(" ")[0]).every((v, i, arr) => v === arr[0]);
			const subDivision = uniqueRegions.map(r => r.split(" ")[1]).every((v, i, arr) => v === arr[0]);
			if (mainDivision || subDivision) {
				return `${uniqueRegions[0].split(" ")[0]} ${uniqueRegions.map(r => r.split(" ")[1]).join(", ")}`;
			}
			return uniqueRegions.join(", ");
		} else {
			return `${uniqueRegions[0]} 등 ${uniqueRegions.length}곳`;
		}
	};

	const formatArea = (region) => {
		const regionList = region.split(",").map(item => item.trim());
		const uniqueRegions = [...new Set(regionList)]; // 중복 제거

		if (uniqueRegions.length > 1) {
			const mainRegion = uniqueRegions[0].split(" ")[0]; // 첫 번째 지역의 도/시 부분 추출
			const formattedRegions = uniqueRegions.map(r => r.replace(mainRegion, "").trim()).join(", ");
			return `${mainRegion} ${formattedRegions}`;
		} else {
			return uniqueRegions[0]; // 중복된 부분이 없으면 그대로 반환
		}
	};

	const openFilterModal = () => {
		resetModalValues(); // 모달이 열릴 때 값을 초기화
		setIsFilterModalOpen(true);
	};



	const renderAlertItem = ({ item }) => (
		<TouchableOpacity onPress={() => handleAlertPress(item)} style={styles.alertItem}>
			<View style={styles.alertHeader}>
				<Ionicons name="notifications" size={20} color="#1e90ff" style={styles.icon} />
				<Text style={styles.Messageregion}>{formatRegions(item.region_name)}</Text>
				<Text style={styles.Messagedate}>{item.registered_at}</Text>
			</View>
			<Text style={styles.message}>{item.message_content}</Text>
		</TouchableOpacity>
	);

	const closeFilterModalAndReset = () => {
		setIsFilterModalOpen(false); // 필터 모달 닫기
		resetModalValues();           // 필터 모달 값 초기화
	};

	return (
		<Provider>
			<View style={styles.container}>
				<View style={styles.searchBar}>
					<View style={styles.searchInputContainer}>
						<Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
						<TextInput
							style={styles.searchInput}
							placeholder="지역 또는 키워드로 검색"
							value={searchTerm}
							onChangeText={setSearchTerm}
						/>
					</View>
					<TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
						<Ionicons name="search" size={20} color="white" />
					</TouchableOpacity>
					<TouchableOpacity onPress={openFilterModal} style={styles.filterButton}>
						<MaterialIcons name="filter-list" size={20} color="black" />
					</TouchableOpacity>
				</View>
				<FlatList
					data={alerts}
					renderItem={renderAlertItem}
					keyExtractor={(item, index) => `${item.id}-${index}`}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.1}
					refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
					ListEmptyComponent={
						!isLoading && (
							<View style={styles.emptyMessageContainer}>
								{apiError ? (
									<Text style={styles.errorMessageText}>인터넷 연결을 확인하세요.</Text>
								) : (
									<Text style={styles.emptyMessageText}>검색 결과가 없습니다.</Text>
								)}
							</View>
						)
					}
					ListFooterComponent={isLoading && <ActivityIndicator size="large" color="#1e90ff" />}
					removeClippedSubviews={true}
				/>
				{/* 재난 경고 모달 */}
				<Portal>
					<Modal visible={isDetailModalOpen} onDismiss={() => setIsDetailModalOpen(false)}>
						<View style={styles.MessagemodalContainer}>
							<TouchableOpacity
								style={styles.ModalcloseButton}
								onPress={() => setIsDetailModalOpen(false)} // 단순히 모달만 닫기
							>
								<Ionicons name="close" size={24} color="#000" />
							</TouchableOpacity>
							{selectedAlert && (
								<>
									<View style={styles.MessagemodalRow}>
										<Text style={styles.MessagemodalContent}></Text>
									</View>
									<Text style={styles.MessageModalTitle}>재난 경고 상세 정보</Text>
									<View style={styles.MessagemodalRow}>
										<Text style={styles.MessagemodalContentcreated_at}>발생일: {selectedAlert.created_at} / {formatArea(selectedAlert.disaster_type)}</Text>
									</View>
									<Text style={styles.MessagemodalContentregion_name}>
										지역: {formatArea(selectedAlert.region_name)}
									</Text>
									<View style={{ marginVertical: 20 }}>
										<Text style={styles.MessagemodalLabel}>메시지 내용:</Text>
										<Text style={styles.MessagemodalContent}>{extractAndDisplayLinks(selectedAlert.message_content)}</Text>
									</View>
									<TouchableOpacity
										onPress={() => handleShare(newsData)}
										style={styles.iconButton}
									>
										<MaterialIcons
											name="share"
											size={20}
											color={"black"}
										/>
									</TouchableOpacity>
								</>
							)}
						</View>
					</Modal>
				</Portal>

				{/* 검색 필터 모달 */}
				<Portal>
					<Modal
						visible={isFilterModalOpen || showCalendar}
						onDismiss={() => {
							setIsFilterModalOpen(false);
							setShowCalendar(false);
							resetModalValues();
						}}
						dismissable={false}
					>
						<View style={styles.RegionModalContainer}>
							{!showCalendar && (
								<TouchableOpacity
									style={styles.RegioncloseButton}
									onPress={closeFilterModalAndReset}
								>
									<Ionicons name="close" size={24} color="#000" />
								</TouchableOpacity>
							)}
							{!showCalendar ? (
								<>
									<Text style={styles.RegionmodalTitle}>필터</Text>
									<Text style={styles.RegionfilterLabel}>지역 선택</Text>
									<DropDownPicker
										open={open}
										value={value}
										items={items}
										setOpen={setOpen}
										setValue={setValue}
										placeholder="지역 선택"
										dropDownContainerStyle={styles.RegiondropDownContainer}
										style={styles.RegiondropDownContainer}
										zIndex={3000}
										zIndexInverse={1000}
									/>
									<Text style={styles.RegionfilterLabel}>메뉴 선택</Text>
									<DropDownPicker
										open={openCategoryPicker}
										value={selectedCategory}
										items={sortedCategories}
										setOpen={setOpenCategoryPicker}
										setValue={setSelectedCategory}
										placeholder="전체 선택"
										dropDownContainerStyle={styles.RegiondropDownContainer}
										style={styles.RegiondropDownContainer}
										zIndex={2000}
										zIndexInverse={1500}
									/>
									<Text style={styles.RegionfilterLabel}>날짜 선택</Text>
									<Button onPress={() => setShowCalendar(true)} mode="outlined">
										{selectedDate ? selectedDate : "날짜 선택"}
									</Button>

									<View style={styles.RegionbuttonContainer}>
										<Button
											mode="contained"
											onPress={resetModalValues}
											style={styles.RegionresetButton}
										>
											초기화
										</Button>
										<Button
											mode="contained"
											onPress={handleFilterApply}
											style={styles.RegionapplyButton}
										>
											적용
										</Button>
									</View>
								</>
							) : (
								<>
									<Text style={styles.RegionmodalTitle}>날짜 선택</Text>
									<Calendar
										onDayPress={(day) => {
											setSelectedDate(day.dateString);
											setShowCalendar(false);
										}}
										maxDate={new Date().toISOString().split('T')[0]}
										style={styles.Regioncalendar}
									/>
								</>
							)}
						</View>
					</Modal>
				</Portal>

			</View>
		</Provider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa"
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
		height: 40
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
	alertItem: {
		backgroundColor: "#ffffff",
		padding: 16,
		margin: 8,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1,
		elevation: 3
	},
	alertHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8
	},
	icon: {
		marginRight: 8
	},
	Messageregion: {
		fontSize: 14,
		color: "#1e90ff",
		flex: 1
	},
	message: {
		fontSize: 14,
		color: "#333"
	},
	emptyMessageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyMessageText: {
		fontSize: 16,
		color: "#999",
		textAlign: "center",
	},
	// 재난 문자 모달 디자인
	MessagemodalContainer: {
		backgroundColor: "#ffffff",
		borderRadius: 20,
		padding: 24,
		marginHorizontal: 20,
		shadowColor: "rgba(0, 0, 0, 0.2)",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 10,
		borderWidth: 1,
		borderColor: "#ffcc00", // 경고 색상 (노란색 계열 유지)
		animationType: 'slide', // 모달 열릴 때 부드러운 슬라이드 애니메이션 추가
	},

	MessageModalTitle: {
		fontSize: 26,
		fontWeight: "bold",
		textAlign: "center",
		color: "#d63031", // 강렬한 경고의 느낌을 위해 진한 빨간색 사용
		marginBottom: 16
	},

	MessagemodalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	MessagemodalLabel: {
		fontSize: 18,
		fontWeight: "600",
		color: "#2d3436",
		marginBottom: 8,
	},

	MessagemodalContent: {
		fontSize: 16,
		color: "#34495e",
		lineHeight: 26,
		letterSpacing: 0.5,
	},

	MessagemodalContentcreated_at: {
		fontSize: 14,
		color: "#636e72",
		marginBottom: 8,
	},

	MessagemodalContentregion_name: {
		fontSize: 17,
		fontWeight: "500",
		color: "#2980b9",
		marginBottom: 10,
		marginTop: 7
	},

	MessageModallinkText: {
		color: "#0984e3",
		textDecorationLine: "underline",
		fontWeight: "600",
		marginVertical: 8,
		fontSize: 16,
	},

	MessagemodalFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#dfe6e9",
		paddingTop: 10,
	},
	ModalcloseButton:
	{
		position: 'absolute',
		top: 10,
		right: 10,
		zIndex: 10,
		padding: 8,
		backgroundColor: '#ffffff',
		borderRadius: 50,
	},

	// 검색 필터 모달 디자인
	RegionModalContainer: {
		backgroundColor: "#ffffff",
		borderRadius: 20,
		padding: 28,
		marginHorizontal: 20,
		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},

	RegionmodalTitle: {
		fontSize: 22,
		fontWeight: "700",
		marginBottom: 16,
		textAlign: "center",
		color: "#333",
	},

	RegiondropDownContainer: {
		backgroundColor: "#f9f9f9",
		borderColor: "#ddd",
		borderRadius: 10,
		marginTop: 12,
	},

	RegionbuttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},

	RegionfilterLabel: {
		fontSize: 18,
		fontWeight: "500",
		marginVertical: 10,
		color: "#333",
	},

	Regioncalendar: {
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "#e0e0e0",
		marginVertical: 16,
	},

	RegionresetButton: {
		marginRight: 12,
		backgroundColor: "#e74c3c",
	},

	RegionapplyButton: {
		marginLeft: 12,
		backgroundColor: "#2E9AFE",
	},
	RegioncloseButton:
	{
		position: 'absolute',
		top: 10,
		right: 10,
		zIndex: 10,
		padding: 8,
		backgroundColor: '#ffffff',
		borderRadius: 50,
	}
}
);
// tabs/News/tabs/DisasterMSG/index.js

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Linking } from "react-native";
import { Modal, Portal, Button, Provider, Menu, Divider } from "react-native-paper";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import DropDownPicker from 'react-native-dropdown-picker';
import regions from './regions.js';


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
	const [apiError, setApiError] = useState(false); // API 오류 상태 관리
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedAlert, setSelectedAlert] = useState(null);



	useEffect(() => {
		if (hasMore && !isLoading) { // 더 많은 데이터가 있고, 현재 로딩 중이 아닐 때만 요청
			fetchAlerts();
		}
	}, [page, selectedRegion, selectedDate]);

	const fetchAlerts = async () => {
		if (!hasMore || isLoading) return; // 이미 로딩 중일 때는 중복 요청 방지
		setIsLoading(true); // 데이터 로딩 시작
		setApiError(false); // API 오류 상태 초기화

		const requestData = {
			pageNo: page,
			numOfRows: 10, // 한 번에 10개씩 데이터를 요청합니다.
			region_name: searchTerm || (selectedRegion !== "전국" ? selectedRegion : undefined),
			created_at: selectedDate || undefined,
		};

		//console.log('요청 데이터:', JSON.stringify(requestData)); // 요청 데이터를 JSON 형식으로 출력

		try {
			const response = await axios.get(`https://apis.uiharu.dev/drps/disaster_msg/api.php`, {
				params: requestData,
			});

			const data = response.data.data;

			if (data.length < 10) {
				setHasMore(false); // 데이터가 더 이상 없으면 중지
			}

			setAlerts((prevAlerts) => {
				const combinedAlerts = [...prevAlerts, ...data];
				return combinedAlerts.filter(
					(alert, index, self) =>
						index === self.findIndex(
							(a) => a.serial_number === alert.serial_number
						)
				);
			});

			setPage((prevPage) => prevPage + 1); // 다음 페이지로 이동
		} catch (error) {
			//console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
			setApiError(true); // API 오류 상태를 true로 설정
		} finally {
			setIsLoading(false); // 데이터 로딩 종료
		}
	};

	const handleAlertPress = (alert) => {
		setSelectedAlert(alert);
		setIsDetailModalOpen(true);
	};

	const resetModalValues = () => {
		setSelectedRegion("전국");
		setSelectedDate("");
		setValue("전국");
	};

	const handleSearch = () => {
		setAlerts([]);
		setPage(1);
		setHasMore(true);
		fetchAlerts(); // 검색어를 포함하여 데이터를 요청
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading) { // 데이터가 더 있고, 현재 로딩 중이 아닐 때만 요청
			setPage(prevPage => prevPage + 1);
		}
	};

	const extractAndDisplayLinks = (text) => {
		// 역슬래시를 슬래시로 변환하여 텍스트를 정리합니다.
		const cleanText = text.replace(/\\/g, '/'); // 역슬래시를 슬래시로 변환합니다.
		// http 또는 https 없이도 도메인 형식을 가진 모든 링크를 인식하도록 정규식 수정
		const urlRegex = /(\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?\b)/gi;
		const parts = cleanText.split(urlRegex);
	
		return parts.map((part, index) => {
			if (urlRegex.test(part)) {
				// URL 앞에 http://를 추가하여 링크로 만들기
				const formattedLink = part.startsWith('http') ? part : `https://${part}`;
				return (
					<Text key={index} style={styles.linkText} onPress={() => Linking.openURL(formattedLink)}>
						{part}
					</Text>
				);
			}
			return <Text key={index} style={{ color: "#333" }}>{part}</Text>;
		});
	};
	
	
	const handleRefresh = () => {
		setIsRefreshing(true);
		setPage(1);
		setAlerts([]);
		setHasMore(true);
		setIsRefreshing(false);
	};

	const handleFilterApply = () => {
		setIsFilterModalOpen(false);
		setAlerts([]);
		setPage(1);
		setHasMore(true);
		fetchAlerts();
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

	const openFilterModal = () => {
		resetModalValues(); // 모달이 열릴 때 값을 초기화
		setIsFilterModalOpen(true);
	};

	const renderAlertItem = ({ item }) => (
		<TouchableOpacity onPress={() => handleAlertPress(item)} style={styles.alertItem}>
			<View style={styles.alertHeader}>
				<Ionicons name="notifications" size={20} color="#1e90ff" style={styles.icon} />
				<Text style={styles.region}>{formatRegions(item.region_name)}</Text>
				<Text style={styles.date}>{item.registered_at}</Text>
			</View>
			<Text style={styles.message}>{item.message_content}</Text>
		</TouchableOpacity>
	);

	return (
		<Provider>
			<View style={styles.container}>
				<View style={styles.searchBar}>
					<View style={styles.searchInputContainer}>
						<Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
						<TextInput style={styles.searchInput} placeholder="지역 또는 키워드로 검색" value={searchTerm} onChangeText={setSearchTerm} />
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
					onEndReached={handleLoadMore} // 리스트의 끝에 도달했을 때 추가 데이터를 요청
					onEndReachedThreshold={0.1} // 화면 끝에서 10% 남았을 때 데이터를 요청하도록 설정
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
					ListFooterComponent={isLoading && <ActivityIndicator size="large" color="#1e90ff" />} // 로딩 중일 때만 로딩 표시
					removeClippedSubviews={true} // 화면 밖의 항목을 메모리에서 제거하여 성능 최적화
				/>
				{/* 모달 컴포넌트 추가 부분 */}
				<Portal>
					<Modal visible={isDetailModalOpen} onDismiss={() => setIsDetailModalOpen(false)}>
						<View style={styles.modalContainer}>
							{selectedAlert && (
								<>
									<Text style={styles.modalTitle}>재난 경고 상세 정보</Text>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>메시지:{extractAndDisplayLinks(selectedAlert.message_content)}</Text>
									</View>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>지역: {selectedAlert.region_name}</Text>
									</View>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>발생 일자: {selectedAlert.created_at}</Text>
									</View>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>등록 일자: {selectedAlert.registered_at}</Text>
									</View>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>일련 번호: {selectedAlert.serial_number}</Text>
									</View>
									<View style={styles.modalContent}>
										<Text style={styles.modalLabel}>수정 일자: {selectedAlert.modified_at}</Text>
									</View>
								</>
							)}
						</View>
					</Modal>
				</Portal>
				<Portal>
					<Modal
						visible={isFilterModalOpen || showCalendar} // 두 모달을 하나로 통합
						onDismiss={() => {
							setIsFilterModalOpen(false);
							setShowCalendar(false);
							resetModalValues(); // 모달이 닫힐 때 초기화 함수 호출
						}}
					>
						<View style={styles.modalContainer}>
							{!showCalendar ? ( // 필터 모달 내용
								<>
									<Text style={styles.modalTitle}>필터</Text>

									<Text style={styles.filterLabel}>지역 선택</Text>
									<DropDownPicker
										open={open}
										value={value}
										items={items}
										setOpen={setOpen}
										setValue={(value) => {
											setValue(value);
											setSelectedRegion(value);
										}}
										setItems={setItems}
										style={styles.regionSelectButton}
										placeholder="지역 선택"
										dropDownContainerStyle={{ backgroundColor: "#dfdfdf" }}
									/>

									<Text style={styles.filterLabel}>날짜 선택</Text>
									<Button onPress={() => setShowCalendar(true)} mode="outlined">
										{selectedDate ? selectedDate : "날짜 선택"}
									</Button>

									<View style={styles.buttonContainer}>
										<Button
											mode="outlined"
											onPress={() => {
												resetModalValues(); // 초기화 버튼 클릭 시 초기화 함수 호출
											}}
											style={styles.resetButton}
										>
											초기화
										</Button>
										<Button
											mode="contained"
											onPress={handleFilterApply}
											style={styles.applyButton}
										>
											적용
										</Button>
									</View>
								</>
							) : ( // 캘린더 모달 내용
								<>
									<Text style={styles.modalTitle}>날짜 선택</Text>
									<Calendar
										onDayPress={(day) => {
											setSelectedDate(day.dateString);
											setShowCalendar(false);
										}}
										maxDate={new Date().toISOString().split('T')[0]} // 오늘 날짜까지만 선택 가능하도록 설정
										style={styles.calendar}
									/>
									<Button
										mode="outlined"
										onPress={() => setShowCalendar(false)} // 닫기 버튼으로 캘린더 모달 닫기
										style={styles.closeButton}
									>
										닫기
									</Button>
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
	region: {
		fontSize: 14,
		color: "#1e90ff",
		flex: 1
	},
	date: {
		fontSize: 12,
		color: "#666"
	},
	message: {
		fontSize: 14,
		color: "#333"
	},
	modalContainer: {
		backgroundColor: "#ffffff",
		borderRadius: 20,
		padding: 16,
		marginHorizontal: 20
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 12
	},
	filterLabel: {
		fontSize: 16,
		fontWeight: "bold",
		marginVertical: 8
	},
	regionSelectButton: {
		backgroundColor: "#f0f0f0",
		padding: 12,
		borderRadius: 10,
		marginBottom: 10
	},
	calendar: {
		borderTopWidth: 1,
		paddingTop: 5,
		borderBottomWidth: 1,
		borderColor: "#eee",
		height: 350,
		marginHorizontal: 10
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16
	},
	resetButton: {
		flex: 1,
		marginRight: 8
	},
	applyButton: {
		flex: 1,
		marginLeft: 8
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
		modalContainer: {
			backgroundColor: "#ffffff",
			borderRadius: 15,
			padding: 20,
			marginHorizontal: 20,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.25,
			shadowRadius: 4,
			elevation: 5,
		},
		modalTitle: {
			fontSize: 22,
			fontWeight: "bold",
			marginBottom: 15,
			textAlign: "center",
			color: "#333",
		},
		modalContent: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginBottom: 15,
			paddingBottom: 10,
			borderBottomWidth: 1,
			borderBottomColor: "#e0e0e0",
		},
		modalLabel: {
			fontSize: 16,
			fontWeight: "bold",
			color: "#444",
			flex: 1,
		},
		linkText: {
			color: "#1e90ff",
			textDecorationLine: "underline",
			fontWeight: "600",
		},
		closeButton: {
			marginTop: 10,
			alignSelf: 'center',
		}
	}
);

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { Modal, Portal, Button, Provider, Menu, Divider } from "react-native-paper";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

const regions = [
	"전국",
	"서울특별시",
	"부산광역시",
	"대구광역시",
	"인천광역시",
	"광주광역시",
	"대전광역시",
	"울산광역시",
	"세종특별자치시",
	"경기도",
	"강원특별자치도",
	"충청북도",
	"충청남도",
	"전북특별자치도",
	"전라남도",
	"경상북도",
	"경상남도",
	"제주특별자치도"
];

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

	useEffect(() => {
		fetchAlerts();
	}, [page, selectedRegion, selectedDate]);

	const fetchAlerts = async () => {
		if (!hasMore) return;
		setIsLoading(true);
		try {
			const response = await axios.get(`https://apis.uiharu.dev/drps/disaster_msg/api.php`, {
				params: {
					pageNo: page,
					region_name: selectedRegion !== "전국" ? selectedRegion : undefined,
					created_at: selectedDate || undefined
				}
			});

			const data = response.data.data;
			if (data.length < 10) {
				setHasMore(false);
			}

			const filteredData = data.filter(
				(alert, index) =>
					(alert.message_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
						alert.region_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
					(selectedRegion === "전국" || alert.region_name.includes(selectedRegion)) &&
					index === data.findIndex(a => a.id === alert.id) // Ensure unique keys
			);

			setAlerts(prevAlerts => [...prevAlerts, ...filteredData]);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = () => {
		setAlerts([]);
		setPage(1);
		setHasMore(true);
	};

	const handleLoadMore = () => {
		if (hasMore) setPage(prevPage => prevPage + 1);
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

	const renderAlertItem = ({ item }) => (
		<View style={styles.alertItem}>
			<View style={styles.alertHeader}>
				<Ionicons name="notifications" size={20} color="#1e90ff" style={styles.icon} />
				<Text style={styles.region}>{formatRegions(item.region_name)}</Text>
				<Text style={styles.date}>{item.registered_at}</Text>
			</View>
			<Text style={styles.message}>{item.message_content}</Text>
		</View>
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
					<TouchableOpacity onPress={() => setIsFilterModalOpen(true)} style={styles.filterButton}>
						<MaterialIcons name="filter-list" size={20} color="black" />
					</TouchableOpacity>
				</View>

				<FlatList
					data={alerts}
					renderItem={renderAlertItem}
					keyExtractor={item => item.id.toString()} // Ensure keys are unique using item id
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
					ListFooterComponent={isLoading && <ActivityIndicator size="large" color="#1e90ff" />}
				/>

				<Portal>
					<Modal visible={isFilterModalOpen} onDismiss={() => setIsFilterModalOpen(false)}>
						<View style={styles.modalContainer}>
							<Text style={styles.modalTitle}>필터</Text>

							<Text style={styles.filterLabel}>지역 선택</Text>
							<TouchableOpacity onPress={() => setRegionMenuVisible(true)} style={styles.regionSelectButton}>
								<Text>{selectedRegion}</Text>
							</TouchableOpacity>

							<Menu
								visible={regionMenuVisible}
								onDismiss={() => setRegionMenuVisible(false)}
								anchor={
									<Button onPress={() => setRegionMenuVisible(true)} style={{ marginTop: 16 }}>
										{selectedRegion}
									</Button>
								}
							>
								{regions.map(region => (
									<Menu.Item
										key={region}
										onPress={() => {
											setSelectedRegion(region);
											setRegionMenuVisible(false);
										}}
										title={region}
									/>
								))}
							</Menu>

							<Text style={styles.filterLabel}>날짜 선택</Text>
							<Button onPress={() => setShowCalendar(true)} mode="outlined" style={styles.datePickerButton}>
								{selectedDate ? selectedDate : "날짜 선택"}
							</Button>

							<Button mode="contained" onPress={handleFilterApply} style={styles.applyButton}>
								적용
							</Button>
						</View>
					</Modal>
				</Portal>

				<Portal>
					<Modal visible={showCalendar} onDismiss={() => setShowCalendar(false)}>
						<Calendar
							onDayPress={day => {
								setSelectedDate(day.dateString);
								setShowCalendar(false);
							}}
							markedDates={{
								[selectedDate]: { selected: true, selectedColor: "#1e90ff" }
							}}
							style={styles.calendar}
							theme={{
								selectedDayBackgroundColor: "#1e90ff",
								todayTextColor: "#1e90ff"
							}}
						/>
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
	applyButton: {
		marginTop: 16
	},
	datePickerButton: {
		marginTop: 16
	},
	calendar: {
		borderTopWidth: 1,
		paddingTop: 5,
		borderBottomWidth: 1,
		borderColor: "#eee",
		height: 350,
		marginHorizontal: 10
	}
});

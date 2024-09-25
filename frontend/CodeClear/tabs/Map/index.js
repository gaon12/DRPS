import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Linking, Animated, Text, Modal, Alert } from "react-native";
import MapView, { Marker, UrlTile, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SettingsContext } from '../../Context'; // Import SettingsContext
import ShelterDetailsModal from './modal/ShelterDetailsModal';

const Map = () => {
	const mapRef = useRef(null);
	const { settings } = useContext(SettingsContext); // Use context to get settings
	const { useOpenStreetMap } = settings; // Destructure the map setting

	const [region, setRegion] = useState({
		latitude: 37.5665,
		longitude: 126.978,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});
	const [currentLocation, setCurrentLocation] = useState(null); // Store current location separately
	const [isLoadingLocation, setIsLoadingLocation] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const animatedHeight = useRef(new Animated.Value(50)).current;
	const [toggleStates, setToggleStates] = useState([false, false, false]);
	const [shelters, setShelters] = useState([]);
	const [filteredShelters, setFilteredShelters] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedShelter, setSelectedShelter] = useState(null);

	const shelterTypes = ["CivilDefenseShelters", "EarthquakeShelters", "TsunamiShelters"];
	const shelterColors = ["#00FF00", "#FF4500", "#1E90FF"];

	useEffect(() => {
		const fetchLocation = async () => {
			setIsLoadingLocation(true);
			Toast.show({
				type: "info",
				text1: "현재 위치를 찾고 있습니다...", // Display this message while fetching
				position: "top",
			});

			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.log("위치 권한이 거부되었습니다.");
				setIsLoadingLocation(false);
				return;
			}

			const userLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});

			const { latitude, longitude } = userLocation.coords;
			setCurrentLocation({ latitude, longitude });
			setRegion(prevRegion => ({
				...prevRegion,
				latitude,
				longitude,
			}));
			setIsLoadingLocation(false);
		};

		fetchLocation();
	}, []);

	useEffect(() => {
		// Fetch shelters whenever region or toggles change
		fetchShelters(1);
	}, [region, toggleStates]);

	const fetchShelters = async (pageNo) => {
		if (!region) return;

		const zoomLevel = calculateZoomLevel(region.latitudeDelta);
		const activeShelterTypes = shelterTypes.filter((_, index) => toggleStates[index]);

		const requests = activeShelterTypes.map(type =>
			fetch(
				`https://apis.uiharu.dev/drps/shelters/api.php?ShelterType=${type}&latitude=${region.latitude}&longitude=${region.longitude}&distance=${zoomLevel}&pageNo=${pageNo}&numOfRows=10`
			).then(res => res.json())
		);

		try {
			const results = await Promise.all(requests);
			const allShelters = results.flatMap((result, index) => {
				if (result.StatusCode === 200) {
					const type = activeShelterTypes[index];
					return result.data.map(shelter => ({ ...shelter, type }));
				}
				return [];
			});
			setShelters(prevShelters => [...prevShelters, ...allShelters]);
			setFilteredShelters(filterSheltersByDistance([...shelters, ...allShelters], zoomLevel));
		} catch (error) {
			console.error("대피소 데이터 로드 중 오류 발생:", error);
		}
	};

	const filterSheltersByDistance = (shelters, distance) => shelters.filter(shelter => shelter.distance <= distance);

	const calculateZoomLevel = latitudeDelta => {
		const maxZoomDistance = 10000;
		const minZoomDistance = 1;
		const distance = Math.min(Math.max((1 / latitudeDelta) * 1000, minZoomDistance), maxZoomDistance);
		return Math.round(distance);
	};

	const moveToCurrentLocation = () => {
		if (currentLocation && mapRef.current) {
			requestAnimationFrame(() => {
				mapRef.current.animateToRegion({ ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
			});
		}
	};

	const toggleButtonExpansion = () => {
		Animated.timing(animatedHeight, {
			toValue: isExpanded ? 50 : 220,
			duration: 300,
			useNativeDriver: false,
		}).start(() => setIsExpanded(prev => !prev));
	};

	const toggleButtonState = index => {
		setToggleStates(prevStates => {
			const newStates = [...prevStates];
			newStates[index] = !newStates[index];
			return newStates;
		});
	};

	const handleLongPress = index => {
		const shelterNames = ["민방위 대피소", "지진 대피소", "해일 대피소"];
		Toast.show({
			type: "info",
			text1: `${shelterNames[index]} 버튼`,
			position: "top",
		});
	};

	const fetchShelterDetails = async (shelter) => {
		try {
			const response = await fetch(
				`https://apis.uiharu.dev/drps/shelters/api.php?ShelterType=${shelter.type}&ShelterDetail=${shelter.id}`
			);
			const data = await response.json();
			if (data.StatusCode === 200) {
				setSelectedShelter(data.data);
				setIsModalVisible(true); // Update visibility state here
			} else {
				Alert.alert("오류", "상세 정보를 가져오는 중 문제가 발생했습니다.");
			}
		} catch (error) {
			console.error("Error fetching shelter details:", error);
			Alert.alert("오류", "상세 정보를 가져오는 중 문제가 발생했습니다.");
		}
	};

	const handleMarkerPress = (shelter) => {
		fetchShelterDetails(shelter);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
				<Ionicons name="locate" size={24} color="white" />
			</TouchableOpacity>

			<Animated.View style={[styles.expandableButton, { height: animatedHeight }]}>
				<TouchableOpacity onPress={toggleButtonExpansion} style={styles.arrowButton}>
					<Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="white" />
				</TouchableOpacity>

				{isExpanded && (
					<View style={styles.toggleContainer}>
						{toggleStates.map((state, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.toggleButton, { backgroundColor: state ? "#388E3C" : "#A5D6A7" }]}
								onPress={() => toggleButtonState(index)}
								onLongPress={() => handleLongPress(index)}
							>
								{index === 0 && <MaterialCommunityIcons name="office-building" size={24} color="white" />}
								{index === 1 && <MaterialCommunityIcons name="waves" size={24} color="white" />}
								{index === 2 && <MaterialCommunityIcons name="shield-account" size={24} color="white" />}
							</TouchableOpacity>
						))}
					</View>
				)}
			</Animated.View>

			<MapView
				ref={mapRef}
				style={styles.map}
				region={region}
				onRegionChangeComplete={setRegion}
			>
				{useOpenStreetMap ? (
					<UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} tileSize={256} />
				) : (
					<Marker coordinate={{ latitude: 37.5665, longitude: 126.978 }} title="서울시청" description="서울특별시의 중심" />
				)}

				{/* Fixed current location pin */}
				{currentLocation && (
					<Marker
						coordinate={currentLocation}
						title="현재 위치"
						pinColor="#FF0000"
					/>
				)}

				{filteredShelters.map((shelter, index) => {
					const shelterIndex = shelterTypes.indexOf(shelter.type);
					// 더 유니크한 키 생성
					const uniqueKey = `${shelter.type}-${shelter.id}-${shelter.latitude}-${shelter.longitude}-${index}`;
					return (
						<Marker
							key={uniqueKey}
							coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
							pinColor={shelterColors[shelterIndex]}
						>
							<Callout onPress={() => handleMarkerPress(shelter)}>
								<Text style={styles.calloutAddress}>{shelter.address}</Text>
								<Text style={styles.calloutDistance}>거리: {shelter.distance.toFixed(2)} m</Text>
								<Text>상세 정보 보려면 누르세요</Text>
							</Callout>
						</Marker>
					);
				})}
			</MapView>

			{useOpenStreetMap && (
				<View style={styles.licenseContainer}>
					<Text style={styles.licenseText} onPress={() => Linking.openURL("https://www.openstreetmap.org/copyright")}>
						© OpenStreetMap contributors
					</Text>
				</View>
			)}

			<ShelterDetailsModal
				isVisible={isModalVisible}
				shelter={selectedShelter}
				onClose={() => setIsModalVisible(false)}
			/>
			<Toast />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	locationButton: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "#007AFF",
		padding: 10,
		borderRadius: 50,
		zIndex: 1,
	},
	expandableButton: {
		position: "absolute",
		top: 60,
		right: 10,
		backgroundColor: "#4CAF50",
		width: 44,
		borderRadius: 25,
		alignItems: "center",
		zIndex: 1,
		overflow: "hidden",
	},
	arrowButton: {
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
	toggleContainer: {
		marginTop: 10,
		width: "100%",
		alignItems: "center",
	},
	toggleButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
	},
	map: {
		flex: 1,
	},
	licenseContainer: {
		position: "absolute",
		bottom: 10,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 1,
		backgroundColor: "rgba(255, 255, 255, 0.7)",
	},
	licenseText: {
		color: "#333",
		fontSize: 12,
		textDecorationLine: "underline",
	},
	infoContainer: {
		marginBottom: 10,
		width: '100%',
	},
	calloutAddress: {
		fontSize: 14,
		fontWeight: "bold",
	},
	calloutDistance: {
		fontSize: 12,
		color: "#555",
	},
});

export default Map;

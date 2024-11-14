// ShelterDetailsModal.js
import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Linking, StyleSheet, Image, Platform, Animated, Dimensions } from "react-native";
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { SettingsContext } from "../../../Context"; // Import the SettingsContext

const windowWidth = Dimensions.get('window').width;
const isLargeScreen = windowWidth > 600; // Adjust threshold for tablets and larger screens

// Map service logos
const mapServices = [
	{ name: "네이버 지도", logo: require("./imgs/logo/naver_map.png"), scheme: (shelter) => `nmap://place?lat=${shelter.latitude}&lng=${shelter.longitude}&zoom=17&name=${shelter.facilityName}&appname=com.drps` },
	{ name: "카카오맵", logo: require("./imgs/logo/kakao_map.png"), scheme: (shelter) => `kakaomap://look?p=${shelter.latitude},${shelter.longitude}&q=${shelter.facilityName}` },
	{ name: "구글 지도", logo: require("./imgs/logo/google_maps.png"), scheme: (shelter) => `comgooglemaps://?q=${shelter.facilityName}&center=${shelter.latitude},${shelter.longitude}` },
	...(Platform.OS === 'ios' ? [{ name: "애플 지도", logo: require("./imgs/logo/apple_maps.png"), scheme: (shelter) => `https://maps.apple.com/?q=${shelter.facilityName}&address=${shelter.address.replace(/\s/g, "+")}&ll=${shelter.latitude},${shelter.longitude}` }] : []),
];

const ShelterDetailsModal = ({ isVisible, shelter, onClose }) => {
	const [mapModalVisible, setMapModalVisible] = useState(false);
	const { settings } = useContext(SettingsContext);
	const [fadeAnim] = useState(new Animated.Value(0)); // Animation state for the main modal
	const [mapFadeAnim] = useState(new Animated.Value(0)); // Animation state for the map selection modal

	useEffect(() => {
		if (isVisible) {
			// Fade in animation when the main modal opens
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			// Fade out animation when the main modal closes
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}, [isVisible, fadeAnim]);

	useEffect(() => {
		if (mapModalVisible) {
			// Fade in animation when the map selection modal opens
			Animated.timing(mapFadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			// Fade out animation when the map selection modal closes
			Animated.timing(mapFadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}, [mapModalVisible, mapFadeAnim]);

	const handleMapServiceSelection = (scheme) => {
		Linking.openURL(scheme(shelter)).catch(() => alert("해당 지도 앱이 설치되어 있지 않습니다."));
		setMapModalVisible(false);
	};

	const closeModal = () => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => onClose());
	};

	const closeMapModal = () => {
		Animated.timing(mapFadeAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => setMapModalVisible(false));
	};

	const handleCopyToClipboard = (text) => {
		Clipboard.setStringAsync(text);
		Toast.show({
			type: 'success',
			text1: '클립보드에 복사되었습니다.',
			position: 'bottom',
		});
	};

	if (!shelter) return null; // Return nothing if no shelter is selected

	const isDarkMode = settings.isDarkMode;
	const dynamicStyles = isDarkMode ? styles.darkMode : styles.lightMode;

	return (
		<Modal visible={isVisible} transparent onRequestClose={closeModal}>
			<Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
				<View style={[styles.modalContentContainer, dynamicStyles, isLargeScreen && styles.largeModal]}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>{shelter.facilityName}</Text>
						<TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(true)}>
							<Text style={styles.mapButtonText}>지도 앱으로 길 찾기</Text>
						</TouchableOpacity>
						<View style={styles.infoContainer}>
							<Text style={styles.infoLabel}>주소</Text>
							<TouchableOpacity onPress={() => handleCopyToClipboard(shelter.address)}>
								<Text style={styles.infoText}>{shelter.address}</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.infoContainer}>
							<Text style={styles.infoLabel}>시설면적</Text>
							<TouchableOpacity onPress={() => handleCopyToClipboard(`${shelter.facilityArea}㎡`)}>
								<Text style={styles.infoText}>{shelter.facilityArea}㎡</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.infoContainer}>
							<Text style={styles.infoLabel}>최대 수용인원</Text>
							<TouchableOpacity onPress={() => handleCopyToClipboard(`${shelter.maxCapacity}명`)}>
								<Text style={styles.infoText}>{shelter.maxCapacity}명</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
							<Text style={styles.closeButtonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Animated.View>

			{/* Map Selection Modal */}
			<Modal visible={mapModalVisible} transparent onRequestClose={closeMapModal}>
				<Animated.View style={[styles.modalOverlay, { opacity: mapFadeAnim }]}>
					<View style={[styles.mapSelectionContainer, dynamicStyles, isLargeScreen && styles.largeModal]}>
						{mapServices.map((service, index) => (
							<TouchableOpacity key={index} style={styles.mapServiceButton} onPress={() => handleMapServiceSelection(service.scheme)}>
								<Image source={service.logo} style={styles.mapServiceLogo} resizeMode="contain" />
								<Text style={styles.mapServiceText}>{service.name}</Text>
							</TouchableOpacity>
						))}
						<TouchableOpacity style={styles.closeButton} onPress={closeMapModal}>
							<Text style={styles.closeButtonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</Modal>

			{/* Toast Message */}
			<Toast />
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContentContainer: {
		width: '90%',
		maxWidth: 500,
		borderRadius: 10,
		padding: 20,
	},
	largeModal: {
		width: '70%',
		maxWidth: 700,
	},
	modalContent: {
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	mapButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		marginBottom: 20,
	},
	mapButtonText: {
		color: '#fff',
		fontSize: 16,
	},
	infoContainer: {
		marginBottom: 10,
		width: '100%',
	},
	infoLabel: {
		fontSize: 14,
		color: '#888',
	},
	infoText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	closeButton: {
		backgroundColor: '#FF3B30',
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 20,
		marginTop: 10,
	},
	closeButtonText: {
		color: '#fff',
		fontSize: 14,
	},
	mapSelectionContainer: {
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
		width: '80%',
		maxWidth: 500,
	},
	mapServiceButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		marginBottom: 10,
		width: '100%',
		borderRadius: 10,
		backgroundColor: '#f0f0f0',
	},
	mapServiceLogo: {
		width: 30,
		height: 30,
		marginRight: 10,
	},
	mapServiceText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	lightMode: {
		backgroundColor: '#fff',
	},
	darkMode: {
		backgroundColor: '#333',
		borderColor: '#444',
		borderWidth: 1,
	},
});

export default ShelterDetailsModal;
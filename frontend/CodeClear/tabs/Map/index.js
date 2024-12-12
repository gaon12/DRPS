import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, View, TouchableOpacity, Animated, Text, Alert } from "react-native";
import MapView, { Marker, UrlTile, Callout } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import axios from 'axios'; // axios 임포트
import { SettingsContext } from '../../Context';
import ShelterDetailsModal from './modal/ShelterDetailsModal';

const Map = () => {
    const mapRef = useRef(null);
    const { settings } = useContext(SettingsContext);
    const { useOpenStreetMap, location } = settings;

    const [region, setRegion] = useState({
        latitude: location.latitude || 37.5665,
        longitude: location.longitude || 126.978,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
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
        // context에서 가져온 좌표로 지도 이동
        moveToCurrentLocation(location.latitude, location.longitude);
    }, [location]);

    const moveToCurrentLocation = (latitude, longitude) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    useEffect(() => {
        if (region.latitude && region.longitude) {
            fetchShelters(1);
        }
    }, [region, toggleStates]);

    const fetchShelters = async (pageNo) => {
        if (!region) return;

        const zoomLevel = calculateZoomLevel(region.latitudeDelta);
        const activeShelterTypes = shelterTypes.filter((_, index) => toggleStates[index]);

        try {
            const results = await Promise.all(
                activeShelterTypes.map(type => axios.get(`https://apis.uiharu.dev/drps/shelters/api.php`, {
                    params: {
                        ShelterType: type,
                        latitude: region.latitude,
                        longitude: region.longitude,
                        distance: zoomLevel,
                        pageNo,
                        numOfRows: 10,
                    }
                }))
            );

            const allShelters = results.flatMap((result, index) => {
                if (result.data.StatusCode === 200) {
                    const type = activeShelterTypes[index];
                    return result.data.data.map(shelter => ({
                        ...shelter,
                        type,
                        latitude: parseFloat(shelter.latitude),
                        longitude: parseFloat(shelter.longitude),
                    }));
                }
                return [];
            });

            const uniqueShelters = filterUniqueSheltersByCoordinates(allShelters);
            setShelters(uniqueShelters);
            updateFilteredShelters(uniqueShelters, zoomLevel);
        } catch (error) {
            console.error("대피소 데이터 로드 중 오류 발생:", error);
        }
    };

    const updateFilteredShelters = (shelters, distance) => {
        const activeShelterTypes = shelterTypes.filter((_, index) => toggleStates[index]);
        const filtered = shelters.filter(shelter => activeShelterTypes.includes(shelter.type) && shelter.distance <= distance);
        setFilteredShelters(filtered);
    };

    const filterUniqueSheltersByCoordinates = (shelters) => {
        const uniqueShelters = [];
        const shelterSet = new Set();

        shelters.forEach(shelter => {
            const coordinateKey = `${Math.round(shelter.latitude * 100000)}-${Math.round(shelter.longitude * 100000)}`;
            if (!shelterSet.has(coordinateKey)) {
                shelterSet.add(coordinateKey);
                uniqueShelters.push(shelter);
            }
        });

        return uniqueShelters;
    };

    const calculateZoomLevel = latitudeDelta => {
        const maxZoomDistance = 10000;
        const minZoomDistance = 1;
        const distance = Math.min(Math.max((1 / latitudeDelta) * 1000, minZoomDistance), maxZoomDistance);
        return Math.round(distance);
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

    const fetchShelterDetails = async (shelter) => {
        try {
            const { data } = await axios.get(`https://apis.uiharu.dev/drps/shelters/api.php`, {
                params: {
                    ShelterType: shelter.type,
                    ShelterDetail: shelter.id,
                },
            });

            if (data.StatusCode === 200) {
                setSelectedShelter(data.data);
                setIsModalVisible(true);
            } else {
                Alert.alert("오류", "상세 정보를 가져오는 중 문제가 발생했습니다.");
            }
        } catch (error) {
            console.error("Error fetching shelter details:", error);
            Alert.alert("오류", "상세 정보를 가져오는 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.locationButton} onPress={() => moveToCurrentLocation(location.latitude, location.longitude)}>
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

                {/* 사용자의 현재 위치를 고정해서 표시 */}
                {location.latitude && location.longitude && (
                    <Marker
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title="현재 위치"
                        pinColor="#FF0000"
                    />
                )}

                {filteredShelters.map((shelter, index) => {
                    const shelterIndex = shelterTypes.indexOf(shelter.type);
                    const uniqueKey = `${shelter.type}-${shelter.id}-${shelter.latitude}-${shelter.longitude}-${index}`;
                    return (
                        <Marker
                            key={uniqueKey}
                            coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
                            pinColor={shelterColors[shelterIndex]}
                        >
                            
                            <Callout onPress={() => fetchShelterDetails(shelter)}>
                                
                                    <Text style={styles.calloutAddress}>{shelter.address}</Text>
                                    <Text style={styles.calloutDistance}>거리: {shelter.distance.toFixed(2)} m</Text>
                                    <Text>상세 정보 보려면 누르세요</Text>
                                
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

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
    calloutAddress: {
        fontSize: 14,
        fontWeight: "bold",
    },
    calloutDistance: {
        fontSize: 12,
        color: "#555",
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
    
});

export default Map;

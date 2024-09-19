import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Linking, Animated } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const Map = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isOsm, setIsOsm] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false); // 버튼 확장 상태
  const animatedHeight = useRef(new Animated.Value(50)).current; // 버튼 높이 애니메이션 기본값 50
  const [toggleStates, setToggleStates] = useState([false, false, false]); // 각 토글 버튼의 on/off 상태
  const [shelters, setShelters] = useState([]); // API로부터 받은 대피소 데이터
  const [filteredShelters, setFilteredShelters] = useState([]); // 반경 2km 이내의 대피소

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 권한이 거부되었습니다.');
        setIsLoadingLocation(false);
        return;
      }

      const lastKnownLocation = await Location.getLastKnownPositionAsync();
      if (lastKnownLocation) {
        const { latitude, longitude } = lastKnownLocation.coords;
        setLocation({ latitude, longitude });
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude,
          longitude,
        }));
        setIsLoadingLocation(false);
        Toast.show({
          type: 'info',
          text1: '현재 위치를 정확히 잡기 전까지는 오차가 있을 수 있습니다.',
          position: 'top',
        });
        setLocationAccuracy(false);
      }

      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = userLocation.coords;
      setLocation({ latitude, longitude });
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude,
        longitude,
      }));
      setLocationAccuracy(true);
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    // API 데이터 가져오기
    const fetchShelters = async () => {
      try {
        const response = await fetch('https://apis.uiharu.dev/drps/imsi/shelter/api.php');
        const data = await response.json();
        if (data.statusCode === 200) {
          setShelters(data.data);
        }
      } catch (error) {
        console.error('대피소 데이터 로드 중 오류 발생:', error);
      }
    };

    fetchShelters();
  }, []);

  // 반경 2km 이내의 대피소 필터링
  useEffect(() => {
    if (location && toggleStates[2]) { // 민방위 버튼이 활성화되어 있을 때만
      const filterShelters = shelters.filter((shelter) => {
        const distance = getDistanceFromLatLonInKm(
          location.latitude,
          location.longitude,
          shelter.lat,
          shelter.lon
        );
        return distance <= 2; // 2km 이내만
      });
      setFilteredShelters(filterShelters);
    }
  }, [location, toggleStates, shelters]);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구 반경 (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km 반환
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const moveToCurrentLocation = () => {
    if (location && mapRef.current) {
      requestAnimationFrame(() => {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        }, 1000);
      });
    }
  };

  const toggleMapService = () => {
    setIsOsm((prevIsOsm) => {
      const newService = !prevIsOsm ? 'OSM' : '기본';
      Toast.show({
        type: 'info',
        text1: `${newService} 지도로 변경했습니다.`,
        position: 'top',
      });
      return !prevIsOsm;
    });
  };

  const toggleButtonExpansion = () => {
    if (isExpanded) {
      // 버튼 축소 애니메이션
      Animated.timing(animatedHeight, {
        toValue: 50, // 축소 시 크기
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsExpanded(false));
    } else {
      // 버튼 확장 애니메이션
      setIsExpanded(true);
      Animated.timing(animatedHeight, {
        toValue: 220, // 확장 시 크기 (충분한 높이로 수정)
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const toggleButtonState = (index) => {
    // 토글 버튼 on/off 상태 변경
    setToggleStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.mapServiceButton} onPress={toggleMapService}>
        <MaterialCommunityIcons name={isOsm ? "map" : "map-outline"} size={24} color="white" />
      </TouchableOpacity>

      {/* 화살표 버튼 (애니메이션 적용) */}
      <Animated.View style={[styles.expandableButton, { height: animatedHeight }]}>
        <TouchableOpacity onPress={toggleButtonExpansion} style={styles.arrowButton}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="white" />
        </TouchableOpacity>

        {/* 토글 버튼들 (버튼이 확장될 때 나타남) */}
        {isExpanded && (
          <View style={styles.toggleContainer}>
            {toggleStates.map((state, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.toggleButton,
                  { backgroundColor: state ? '#388E3C' : '#A5D6A7' }, // on 상태일 때 짙은 색
                ]}
                onPress={() => toggleButtonState(index)}
              >
                {/* 토글 아이콘 */}
                {index === 0 && (
                  <MaterialCommunityIcons name="office-building" size={24} color="white" />
                )}
                {index === 1 && (
                  <MaterialCommunityIcons name="waves" size={24} color="white" />
                )}
                {index === 2 && (
                  <MaterialCommunityIcons name="shield-account" size={24} color="white" />
                )}
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
        {isOsm ? (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            tileSize={256}
          />
        ) : (
          <Marker
            coordinate={{ latitude: 37.5665, longitude: 126.9780 }}
            title="서울시청"
            description="서울특별시의 중심"
          />
        )}
        {location && (
          <Marker
            coordinate={location}
            title="현재 위치"
          />
        )}

        {/* 민방위 버튼이 활성화된 경우 대피소 마커 표시 */}
        {toggleStates[2] && filteredShelters.map((shelter) => (
          <Marker
            key={shelter.acmdfclty_sn}
            coordinate={{ latitude: shelter.lat, longitude: shelter.lon }}
            title={shelter.vt_acmdfclty_nm}
            description={shelter.rn_adres}
            pinColor="#00FF00"
          />
        ))}
      </MapView>
      {isLoadingLocation && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {isOsm && (
        <View style={styles.licenseContainer}>
          <Text style={styles.licenseText} onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}>
            © OpenStreetMap contributors
          </Text>
        </View>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  locationButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
    zIndex: 1,
  },
  mapServiceButton: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 50,
    zIndex: 1,
  },
  expandableButton: {
    position: 'absolute',
    top: 110,
    right: 10,
    backgroundColor: '#4CAF50',
    width: 44, // 너비 OSM 버튼과 맞춤
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  arrowButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  toggleButton: {
    width: 40, // GPS 및 OSM 버튼과 크기 동일
    height: 40, // GPS 및 OSM 버튼과 크기 동일
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // 버튼 간 간격 축소
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  licenseContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  licenseText: {
    color: '#333',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default Map;

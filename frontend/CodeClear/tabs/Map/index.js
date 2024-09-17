import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Linking, Text } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; // Toast 메시지 라이브러리 임포트

export default function App() {
  const mapRef = useRef(null); // MapView 참조를 위한 ref
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.5665, // 서울시청 좌표
    longitude: 126.9780,
    latitudeDelta: 0.01, // 줌 레벨 15에 해당하는 값
    longitudeDelta: 0.01,
  });
  const [isOsm, setIsOsm] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // 위치 로딩 상태
  const [locationAccuracy, setLocationAccuracy] = useState(false); // 정확한 위치 여부

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setIsLoadingLocation(false);
        return;
      }

      // getLastKnownPositionAsync()로 대략적인 위치를 빠르게 가져옴
      const lastKnownLocation = await Location.getLastKnownPositionAsync();
      if (lastKnownLocation) {
        const { latitude, longitude } = lastKnownLocation.coords;
        setLocation({ latitude, longitude });
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude,
          longitude,
        }));
        setIsLoadingLocation(false); // 대략적인 위치로 지도를 업데이트
        Toast.show({
          type: 'info',
          text1: '현재 위치를 정확히 잡기 전까지는 오차가 있을 수 있습니다.',
          position: 'top', // 상단에 표시
        });
        setLocationAccuracy(false); // 아직 정확한 위치는 아님
      }

      // 정확한 위치를 백그라운드에서 높은 정확도로 가져온 후, 업데이트
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // 높은 정확도
      }).then((userLocation) => {
        const { latitude, longitude } = userLocation.coords;
        setLocation({ latitude, longitude });
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude,
          longitude,
        }));
        setLocationAccuracy(true); // 정확한 위치 확인
      });
    };

    fetchLocation();
  }, []);

  // 현재 위치로 부드럽게 이동하는 함수 (줌 레벨 유지)
  const moveToCurrentLocation = () => {
    if (location && mapRef.current) {
      requestAnimationFrame(() => {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: region.latitudeDelta, // 줌 레벨 유지
          longitudeDelta: region.longitudeDelta,
        }, 1000); // 1초 동안 부드럽게 이동
      });
    }
  };

  // 지도 서비스 전환 함수
  const toggleMapService = () => {
    requestAnimationFrame(() => {
      setIsOsm((prevIsOsm) => {
        const newService = !prevIsOsm ? 'OSM' : '기본';
        Toast.show({
          type: 'info',
          text1: `${newService} 지도로 변경했습니다.`,
          position: 'top', // 상단에 표시
        });
        return !prevIsOsm;
      });
    });
  };

  return (
    <View style={styles.container}>
      {/* 현재 위치 이동 버튼 */}
      <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>

      {/* 지도 서비스 변경 버튼 (기본 지도/OSM) */}
      <TouchableOpacity style={styles.mapServiceButton} onPress={toggleMapService}>
        <MaterialCommunityIcons name={isOsm ? "map" : "map-outline"} size={24} color="white" />
      </TouchableOpacity>

      <MapView
        ref={mapRef} // MapView에 ref 연결
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {isOsm ? (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" // OSM 타일 URL 설정
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
      </MapView>

      {isLoadingLocation && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* OSM 라이선스 정보 출력 */}
      {isOsm && (
        <View style={styles.licenseContainer}>
          <Text style={styles.licenseText} onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}>
            © OpenStreetMap contributors
          </Text>
        </View>
      )}

      {/* Toast 메시지 컴포넌트 */}
      <Toast />
    </View>
  );
}

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
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // 배경을 추가하여 겹치는 문제 해결
  },
  licenseText: {
    color: '#333',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

// <현재>
// 현재 운영체제의 기본지도를 받아옴
// gps 정보받아오기 + 받아온 정보를 토대로 현재 내 위치로 지도 새로고침 하는 기능
// 토글키 등을 써서 오픈스트리트 등의 오픈라이브러리로 바꾸는 기능.

// <해야할 것>
// 라디오박스처럼 기능 활성/비활성화 (건물 위치 등)
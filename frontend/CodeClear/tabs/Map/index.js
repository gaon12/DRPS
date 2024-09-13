import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Switch, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isOsm, setIsOsm] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      setLocation({ latitude, longitude });
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude,
        longitude,
      }));

      if (webViewRef.current && isOsm) {
        webViewRef.current.postMessage(JSON.stringify({ latitude, longitude }));
      }
    })();
  }, [isOsm]);

  const jsCode = `
    document.addEventListener('message', function(event) {
      var data = JSON.parse(event.data);
      var lat = data.latitude;
      var lon = data.longitude;
      var map = L.map('map').setView([lat, lon], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lon]).addTo(map)
        .bindPopup('현재 위치')
        .openPopup();
    });
  `;

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>OSM</Text>
        <Switch
          value={isOsm}
          onValueChange={(value) => setIsOsm(value)}
        />
      </View>

      {isOsm ? (
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ uri: 'https://www.openstreetmap.org/#map=14/37.5665/126.9780' }}
          injectedJavaScript={jsCode}
        />
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          <Marker
            coordinate={{ latitude: 37.5665, longitude: 126.9780 }}
            title="서울시청"
            description="서울특별시의 중심"
          />
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="현재 위치"
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

// <현재>
// 현재 운영체제의 기본지도를 받아옴
// gps 정보받아오기 + 받아온 정보를 토대로 현재 내 위치로 지도 새로고침 하는 기능
// 토글키 등을 써서 오픈스트리트 등의 오픈라이브러리로 바꾸는 기능.

// <해야할 것>
// 라디오박스처럼 기능 활성/비활성화 (건물 위치 등)

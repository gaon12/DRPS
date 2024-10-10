import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const LocationInfo = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 접근 권한이 필요합니다.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const { latitude, longitude } = currentLocation.coords;
      getAddress(latitude, longitude);  // 좌표로 주소 검색
    })();
  }, []);

  const getAddress = async (latitude, longitude) => {
    try {
      // Nominatim 또는 다른 Geocoding API로 요청
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const { address } = response.data;
      setAddress(address);
    } catch (error) {
      setErrorMsg('주소 정보를 가져올 수 없습니다.');
    }
  };

  return (
    <View>
      <Text>현재 위치 정보:</Text>
      {location ? (
        <Text>위도: {location.coords.latitude}, 경도: {location.coords.longitude}</Text>
      ) : (
        <Text>위치 정보를 불러오는 중...</Text>
      )}

      {address ? (
        <View>
          <Text>시/도: {address.state}</Text>
          <Text>시/군/구: {address.county}</Text>
          <Text>읍/면/동: {address.suburb || address.village || address.town}</Text>
        </View>
      ) : (
        errorMsg && <Text>{errorMsg}</Text>
      )}
    </View>
  );
};

export default LocationInfo;

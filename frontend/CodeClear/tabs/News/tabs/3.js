import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Toast } from 'react-native-toast-message';
import { List } from 'react-native-paper';

const WeatherScreen = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [airQuality, setAirQuality] = useState([]);
  const [expanded, setExpanded] = useState(false); // State for managing the accordion
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  );
  const [standards, setStandards] = useState('WHO'); // Default standard is WHO

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied');
          return;
        }

        const lastKnownLocation = await Location.getLastKnownPositionAsync({});
        const currentLocation = lastKnownLocation || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });

        if (currentLocation) {
          const { latitude, longitude } = currentLocation.coords;
          setLocation(currentLocation.coords);
          fetchCityName(latitude, longitude);
          fetchWeather(latitude, longitude);
          fetchAirQuality(latitude, longitude);
        }
      } catch (error) {
        console.error('Error fetching location or weather data:', error);
        setLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      setCity(response.data.address.city || response.data.address.town || 'Unknown Location');
    } catch (error) {
      console.error('Error fetching city name:', error);
    }
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://api.brightsky.dev/weather?lat=${latitude}&lon=${longitude}&date=${new Date().toISOString().split('T')[0]}`);
      const weatherData = response.data.weather;

      const currentTime = new Date().getHours();
      const todaysForecast = weatherData.filter(hour => new Date(hour.timestamp).getHours() >= currentTime);

      let finalHourlyForecast = [...todaysForecast];
      if (todaysForecast.length < 12) {
        const nextDayWeather = await axios.get(`https://api.brightsky.dev/weather?lat=${latitude}&lon=${longitude}&date=${new Date(Date.now() + 86400000).toISOString().split('T')[0]}`);
        const nextDayForecast = nextDayWeather.data.weather.slice(0, 12 - todaysForecast.length);
        finalHourlyForecast = [...todaysForecast, ...nextDayForecast];
      }

      setHourlyForecast(finalHourlyForecast.slice(0, 12)); // Ensure only 12 items
      setCurrentWeather(weatherData[0]);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirQuality = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://apis.uiharu.dev/drps/air/api.php?latitude=${latitude}&longitude=${longitude}`);
      if (response.data.StatusCode === 200) {
        setAirQuality(response.data.data);
      } else {
        console.warn('Air quality data not found.');
      }
    } catch (error) {
      console.error('Error fetching air quality:', error);
    }
  };

  const handleLongPress = () => {
    const newStandard = standards === 'WHO' ? 'Korean Ministry' : 'WHO';
    setStandards(newStandard);
    Toast.show({
      type: 'info',
      text1: `Standards changed to ${newStandard}`,
      position: 'top',
    });
  };

  const getWeatherIcon = (icon) => {
    const iconMap = {
      'clear-day': 'sun',
      'clear-night': 'moon',
      'partly-cloudy-day': 'cloud',
      'partly-cloudy-night': 'cloud',
      'cloudy': 'cloud',
      'fog': 'cloud-drizzle',
      'wind': 'wind',
      'rain': 'cloud-rain',
      'sleet': 'cloud-drizzle',
      'snow': 'cloud-drizzle',
      'hail': 'cloud',
      'thunderstorm': 'cloud-lightning',
    };
    return <Feather name={iconMap[icon] || 'cloud'} size={40} color="gray" />;
  };

  if (loading || !currentWeather) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Section: City Name and Date */}
      <View style={styles.header}>
        <Text style={styles.location}>{city}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      {/* Current Weather and Temperature */}
      <View style={styles.weatherContainer}>
        {getWeatherIcon(currentWeather.icon)}
        <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
        <Text style={styles.condition}>{currentWeather.condition}</Text>
      </View>

      {/* Hourly Forecast */}
      <View style={styles.forecastContainer}>
        <Text style={styles.sectionTitle}>Hourly Forecast</Text>
        <ScrollView horizontal>
          {hourlyForecast.map((hour, index) => (
            <View key={index} style={styles.hourlyItem}>
              <Text>{new Date(hour.timestamp).getHours()}:00</Text>
              {getWeatherIcon(hour.icon)}
              <Text>{hour.temperature}°C</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Air Quality Information */}
      <TouchableOpacity onLongPress={handleLongPress}>
        <List.Accordion
          title="Air Quality"
          expanded={expanded}
          onPress={() => setExpanded(!expanded)}
          style={styles.accordion}
        >
          {airQuality.map((item, index) => (
            <View key={index} style={styles.infoItem}>
              <Text style={styles.infoTitle}>{item.parameter.toUpperCase()}</Text>
              <Text>{item.value} {item.unit}</Text>
            </View>
          ))}
        </List.Accordion>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 18,
    color: '#777',
    marginTop: 5,
  },
  weatherContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ff9800',
  },
  condition: {
    fontSize: 24,
    color: '#555',
  },
  forecastContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  accordion: {
    backgroundColor: '#ffffff',
    marginVertical: 10,
    borderRadius: 8,
  },
  infoItem: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WeatherScreen;

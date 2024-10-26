// tabs/News/tabs/Weather/index.js

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import SunCalc from 'suncalc';

const WeatherScreen = () => {
	const [currentWeather, setCurrentWeather] = useState(null);
	const [hourlyForecast, setHourlyForecast] = useState([]);
	const [airQuality, setAirQuality] = useState([]);
	const [loading, setLoading] = useState(true);
	const [location, setLocation] = useState(null);
	const [standards, setStandards] = useState('WHO');
	const [city, setCity] = useState('');
	const [sunTimes, setSunTimes] = useState({ sunrise: null, sunset: null });
	const [date, setDate] = useState(
		new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
	);

	const limitStandards = {
		WHO: {
			pm25: [15, 25],
			pm10: [25, 50],
			o3: [0.05, 0.1],
			no2: [0.03, 0.06],
			so2: [0.02, 0.04],
			co: [4, 8],
		},
		'Korean Ministry': {
			pm25: [30, 80],
			pm10: [50, 100],
			o3: [0.1, 0.2],
			no2: [0.03, 0.06],
			so2: [0.02, 0.05],
			co: [2, 9],
		},
	};

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
					const sunTimes = calculateSunTimes(latitude, longitude);
					setSunTimes(sunTimes);
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
			const response = await axios.get(
				`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
				{
					headers: {
						'User-Agent': 'WeatherApp/1.0 (weather@app.com)',
					},
				}
			);

			const address = response.data.address;
			const combinedLocation = [
				address.city,
				address.borough,
				address.quarter,
			]
				.filter(Boolean) // 값이 있는 것만 남기기
				.join(' '); // 공백으로 합치기

			setCity(combinedLocation || 'Unknown Location');
		} catch (error) {
			console.error('Error fetching city name:', error);
			Alert.alert('Error', 'Failed to fetch city name. Please try again later.');
		}
	};


	const getAirQualityStatus = (parameter, value) => {
		if (value === null || value === undefined || isNaN(value)) {
			return { status: '데이터 없음', fill: 0 };
		}

		const limits = limitStandards[standards][parameter] || [0, 100];
		const [good, moderate] = limits;

		let fillPercentage;
		let status;

		if (value <= good) {
			fillPercentage = (value / good) * 33;
			status = '좋음';
		} else if (value <= moderate) {
			fillPercentage = 33 + ((value - good) / (moderate - good)) * 33;
			status = '보통';
		} else {
			fillPercentage = 66 + ((value - moderate) / (100 - moderate)) * 34;
			status = '나쁨';
		}

		return { status, fill: fillPercentage };
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

			const currentWeather = weatherData[0];
			const feelsLikeTemp = calculateFeelsLikeTemp(currentWeather.temperature, currentWeather.wind_speed);
			const relativeHumidity = calculateRelativeHumidity(currentWeather.temperature, currentWeather.dew_point);

			setCurrentWeather({
				...currentWeather,
				apparent_temperature: feelsLikeTemp,
				relative_humidity: relativeHumidity,
			});

			setHourlyForecast(finalHourlyForecast.slice(0, 12));
		} catch (error) {
			console.error('Failed to fetch weather data:', error);
		} finally {
			setLoading(false);
		}
	};

	const calculateFeelsLikeTemp = (temperature, windSpeed) => {
		const windSpeedKmh = windSpeed * 3.6; // m/s -> km/h 변환
		return (
			13.12 + 0.6215 * temperature
			- 11.37 * Math.pow(windSpeedKmh, 0.16)
			+ 0.3965 * Math.pow(windSpeedKmh, 0.16) * temperature
		).toFixed(2);
	};

	const calculateRelativeHumidity = (temperature, dewPoint) => {
		const e = 6.11 * Math.pow(10, (7.5 * dewPoint) / (237.3 + dewPoint));
		const es = 6.11 * Math.pow(10, (7.5 * temperature) / (237.3 + temperature));
		return ((e / es) * 100).toFixed(2);
	};

	const estimatePrecipitationByDewPoint = (dewPoint, relativeHumidity, cloudCover) => {
		if (relativeHumidity === null || dewPoint === null) {
			return '정보 없음';
		}
	
		if (relativeHumidity > 80 && cloudCover > 70) {
			return ' 10mm 이상';
		} else if (relativeHumidity > 60 && dewPoint > 15) {
			return ' 5~10mm';
		} else if (relativeHumidity > 40 && dewPoint > 10) {
			return ' 0.1~5mm';
		} else {
			return '0mm (비 없음)';
		}
	};

	const fetchAirQuality = async (latitude, longitude) => {
		try {
			const response = await axios.get(`https://apis.uiharu.dev/drps/air/api.php?latitude=${latitude}&longitude=${longitude}`);

			if (response.data.StatusCode === 200) {
				setAirQuality(response.data.data); // 새 JSON 형식에 맞게 데이터를 설정합니다.
			} else {
				console.warn('Air quality data not found.');
			}
		} catch (error) {
			console.error('Error fetching air quality:', error);
		}
	};

	const calculateSunTimes = (lat, lon) => {
		const date = new Date();
		const times = SunCalc.getTimes(date, lat, lon);
		return {
			sunrise: convertToKST(times.sunrise),
			sunset: convertToKST(times.sunset),
		};
	};

	const convertToKST = (date) => {
		const kstOffset = 9 * 60;
		const localOffset = date.getTimezoneOffset();
		const totalOffset = kstOffset + localOffset;
		const kstDate = new Date(date.getTime() + totalOffset * 60000);
		return kstDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
	};

	const handleLongPress = () => {
		console.log('Long press event triggered');
		const newStandard = standards === 'WHO' ? 'Korean Ministry' : 'WHO';
		setStandards(newStandard);
		Alert.alert(
			'기준 변경',
			`기준이 ${newStandard}로 변경되었습니다.`,
			[{ text: '확인', onPress: () => console.log('Alert closed') }]
		);
	};

	const getWeatherIcon = (icon) => {
		const iconMap = {
			'clear-day': { name: 'sun', color: '#FE9A2E' }, // 금색(맑은 날)
			'clear-night': { name: 'moon', color: '#FFD700' }, // 회색(맑은 밤)
			'partly-cloudy-day': { name: 'cloud', color: '#87CEEB' }, // 하늘색
			'partly-cloudy-night': { name: 'cloud', color: '#708090' }, // 슬레이트 회색
			'cloudy': { name: 'cloud', color: '#B0C4DE' }, // 밝은 회색
			'fog': { name: 'cloud-drizzle', color: '#778899' }, // 어두운 회색
			'wind': { name: 'wind', color: '#4682B4' }, // 강한 파랑
			'rain': { name: 'cloud-rain', color: '#1E90FF' }, // 다저블루
			'sleet': { name: 'cloud-drizzle', color: '#B0E0E6' }, // 밝은 하늘색
			'snow': { name: 'cloud-drizzle', color: '#ADD8E6' }, // 연한 하늘색
			'hail': { name: 'cloud', color: '#D3D3D3' }, // 연한 회색
			'thunderstorm': { name: 'cloud-lightning', color: '#FFA500' }, // 주황색(번개)
		};

		const { name, color } = iconMap[icon] || { name: 'cloud', color: 'gray' };

		return <Feather name={name} size={40} color={color} />;
	};


	if (loading || !currentWeather) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#00ff00" />
			</View>
		);
	}


	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.weathercontainer}>
				<View style={styles.header}>
					<Text style={[styles.date, styles.dateLeft]}>{date}</Text>
				</View>
				<View style={styles.weatherInfoContainer}>
					<Text style={styles.city}>{city}</Text>
					<Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
					<Text style={styles.condition}>{currentWeather.condition}</Text>
					{getWeatherIcon(currentWeather.icon)}
				</View>
				<View style={styles.additionalInfoContainerHorizontal}>
					<View style={[styles.infoItemHorizontalWithFlex, styles.divider]}>
						<Feather name="thermometer" size={24} color="white" />
						<Text style={styles.infoText}>
							{currentWeather.apparent_temperature ? `${currentWeather.apparent_temperature} °C` : '정보 없음'}
						</Text>
						<Text style={styles.infoText1}>체감</Text>
					</View>
					<View style={[styles.infoItemHorizontalWithFlex, styles.divider]}>
						<Feather name="droplet" size={24} color="white" />
						<Text style={styles.infoText}>
							{currentWeather.relative_humidity !== null ? `${currentWeather.relative_humidity} %` : '정보 없음'}
						</Text>
						<Text style={styles.infoText1}>습도</Text>
					</View>
					<View style={[styles.infoItemHorizontalWithFlex, styles.divider]}>
						<Feather name="cloud-rain" size={24} color="white" />
						<Text style={styles.infoText}>
        {currentWeather.precipitation !== null 
            ? `${currentWeather.precipitation} mm` 
            : estimatePrecipitationByDewPoint(
                currentWeather.dew_point, 
                currentWeather.relative_humidity, 
                currentWeather.cloud_cover
              )}
    </Text>
    <Text style={styles.infoText1}>강수량</Text>
					</View>
					<View style={styles.infoItemHorizontalWithFlex}>
						<Feather name="wind" size={24} color="white" />
						<Text style={styles.infoText}>{currentWeather.wind_speed !== null ? `${currentWeather.wind_speed} m/s` : '정보 없음'}</Text>
						<Text style={styles.infoText1}>풍속</Text>
					</View>
				</View>
			</View>

			{/* Hourly Forecast */}

			<View style={styles.roundedContainer}>
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
				<TouchableOpacity
					onPress={() => console.log('Button Pressed')}
					onLongPress={handleLongPress}
					style={styles.button}
				>
					<Text style={styles.buttonText}>기준 변경</Text>
				</TouchableOpacity>
				<View style={styles.airQualityContainer}>

					{/* Air Quality Information */}

					<Text style={styles.sectionTitle}>Air Quality</Text>
					<View style={styles.gridContainer}>
						{Array.isArray(airQuality) && airQuality.length > 0 ? (
							airQuality.map((item, index) => (
								<View key={index} style={styles.airQualityGridItem}>
									<Text style={styles.airQualityParameter}>{item.parameter}</Text>
									<Text style={styles.airQualityValue}>{item.value} {item.unit}</Text>
									<View style={styles.gaugeContainer}>
										<View
											style={[
												styles.gaugeFill,
												{
													width: `${getAirQualityStatus(item.parameter, item.value).fill}%`,
													backgroundColor: getAirQualityStatus(item.parameter, item.value).fill <= 33 ? '#4CAF50' : getAirQualityStatus(item.parameter, item.value).fill <= 66 ? '#FFC107' : '#F44336',
												},
											]}
										/>
									</View>
								</View>
							))
						) : (
							// 데이터를 못받았을 경우 기본 상태로 게이지만 보여주기
							['pm25', 'pm10', 'o3', 'no2', 'so2', 'co'].map((parameter, index) => (
								<View key={index} style={styles.airQualityGridItem}>
									<Text style={styles.airQualityParameter}>{parameter}</Text>
									<Text style={styles.airQualityValue}>N/A</Text>
									<View style={styles.gaugeContainer}>
										<View
											style={[
												styles.gaugeFill,
												{ width: '0%', backgroundColor: '#e0e0e0' },
											]}
										/>
									</View>
								</View>
							))
						)}
					</View>
				</View>
				{/* sunTimes Information */}

				<View style={styles.sunTimesContainer}>
					<View style={styles.sunContainer}>
						<View style={styles.sunInfo}>
							<Feather name="sun" size={48} color="#FFA726" />
							<Text style={styles.sunTitle}>일출시간</Text>
							<Text style={styles.sunTime}>{sunTimes.sunrise || '정보 없음'}</Text>
							<Text style={styles.sunSubTitle}>일중시간</Text>
							<Text style={styles.sunTime}>12:10</Text>
							<Text style={styles.sunSubTitle}>일몰시간</Text>
							<Text style={styles.sunTime}>{sunTimes.sunset || '정보 없음'}</Text>
						</View>
					</View>
					<View style={styles.moonContainer}>
						<View style={styles.moonInfo}>
							<Feather name="moon" size={48} color="#78909C" />
							<Text style={styles.moonTitle}>월출시간</Text>
							<Text style={styles.moonTime}>14:16</Text>
							<Text style={styles.moonSubTitle}>월중시간</Text>
							<Text style={styles.moonTime}>20:10</Text>
							<Text style={styles.moonSubTitle}>월몰시간</Text>
							<Text style={styles.moonTime}>01:05</Text>
						</View>
					</View>
				</View>

			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: '#4a90e2'
	},
	weathercontainer:
	{
		padding: 23
	},
	header: {
		alignItems: 'center',
		marginBottom: 20,
	},
	date: {
		fontSize: 15,
		color: 'rgba(255, 255, 255, 0.7)',
	},
	dateLeft: {
		alignSelf: 'flex-start',
	},
	city: {
		fontSize: 23,
		color: 'rgba(255, 255, 255, 0.7)',
	},
	weatherInfoContainer: {
		alignItems: 'center',
		marginVertical: 40,
	},
	temperature: {
		fontSize: 68,
		color: 'white',
		fontWeight: 'bold',
	},
	condition: {
		fontSize: 24,
		color: 'white',
		marginBottom: 10,
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
	additionalInfoContainerHorizontal: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 10,
	},
	infoItemHorizontalWithFlex: {
		alignItems: 'center',
		flex: 1,
	},
	infoItem: {
		backgroundColor: '#ffffff',
		padding: 10,
		borderRadius: 10,
		marginBottom: 5,
	},
	infoText: {
		fontSize: 16,
		color: 'white',
		marginTop: 10,
	},
	infoText1: {
		fontSize: 16,
		color: 'white',
		marginTop: 5,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	divider: {
		borderRightWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.5)',
		paddingRight: 10,
	},
	accordion: {
		backgroundColor: '#f0f0f0',
		marginVertical: 10,
	},
	roundedContainer:
	{
		widht: '100%',
		backgroundColor: '#ffffff',
		width: '100%',
		padding: 16,
		borderRadius: 10
	}, gridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginVertical: 10,
	},
	airQualityGridItem: {
		width: '30%',
		marginVertical: 10,
		alignItems: 'center',
	},
	gaugeContainer: {
		width: '100%',
		height: 8,
		backgroundColor: '#e0e0e0',
		borderRadius: 4,
		overflow: 'hidden',
		marginVertical: 4,
	},
	gaugeFill: {
		height: '100%',
		borderRadius: 4,
	},
	airQualityParameter: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
	},
	airQualityValue: {
		fontSize: 12,
		color: '#333',
		marginBottom: 2,
	},
	airQualityStatus: {
		fontSize: 12,
		color: '#333',
		textAlign: 'center',
	},
	button: {
		backgroundColor: '#007bff',
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		textAlign: 'center',
	},
	buttonContainer: {
		marginVertical: 10,
		borderRadius: 5,
		overflow: 'hidden', // 버튼의 모서리를 둥글게 만듭니다
	},
	sunTimesContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#E3F2FD',
		borderRadius: 10,
		padding: 20,
		marginVertical: 20,
	},
	sunContainer: {
		flex: 1,
		alignItems: 'center',
		padding: 10,
		backgroundColor: '#FFF3E0',
		borderRadius: 10,
		marginRight: 10,
	},
	sunInfo: {
		alignItems: 'center',
	},
	sunTitle: {
		fontSize: 18,
		color: '#FB8C00',
		marginTop: 5,
		marginBottom: 10,
	},
	sunSubTitle: {
		fontSize: 14,
		color: '#FB8C00',
		marginTop: 5,
	},
	sunTime: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#FF5722',
		marginBottom: 5,
	},
	moonContainer: {
		flex: 1,
		alignItems: 'center',
		padding: 10,
		backgroundColor: '#ECEFF1',
		borderRadius: 10,
		marginLeft: 10,
	},
	moonInfo: {
		alignItems: 'center',
	},
	moonTitle: {
		fontSize: 18,
		color: '#546E7A',
		marginTop: 5,
		marginBottom: 10,
	},
	moonSubTitle: {
		fontSize: 14,
		color: '#546E7A',
		marginTop: 5,
	},
	moonTime: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#37474F',
		marginBottom: 5,
	}
});

export default WeatherScreen;
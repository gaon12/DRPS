import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅 추가

const CList = () => {
  const navigation = useNavigation(); // 네비게이션 훅 사용

  const items = [
    { id: 1, icon: 'bottle-tonic', text: '중요 물품', screen: 'ImportantObjects' },
    { id: 2, icon: 'door', text: '공통 재해', screen: 'CommonDisasters' },
    { id: 3, icon: 'clipboard-check', text: '나만의 목록', screen: 'MyLists' },
    { id: 4, icon: 'bag-checked', text: '비상용 생존가방', screen: 'EmergencyBags' },
    { id: 5, icon: 'weather-lightning-rainy', text: '지역 재해 대비', screen: 'LocalDisasters' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>체크 목록</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {items.map((item) => (
          <TouchableOpacity 
            key={`checklist-item-${item.id}`} 
            style={styles.itemContainer}
            onPress={() => navigation.navigate(item.screen)} // 네비게이션 연결
          >
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name={item.icon} size={40} color='#ffcc00' />
            </View>
            <Text style={styles.itemText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#003366',
    padding: 15,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  iconWrapper: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
  },
});

export default CList;

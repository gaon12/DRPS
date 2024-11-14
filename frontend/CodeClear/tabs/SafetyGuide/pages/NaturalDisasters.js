import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const MainScreen = ({ navigation }) => {
  const [showList, setShowList] = useState(false); // 전체보기 리스트 표시 여부
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [searchText, setSearchText] = useState('');
  const [selectedDisasters, setSelectedDisasters] = useState({
    bigButton1: '태풍',
    bigButton2: '호우',
    bigButton3: '폭염',
    bigButton4: '한파',
  });
  const [activeDisasters, setActiveDisasters] = useState(['태풍', '호우', '폭염', '한파']);

  // 재난 정보와 매핑되는 ID 리스트
  const modalDataList = [
    { id: '1', mappingId: '01001', title: '가뭄', icon: 'sunny', iconType: 'Ionicons' },
    { id: '2', mappingId: '01002', title: '강풍', icon: 'weather-windy', iconType: 'MaterialCommunityIcons' },
    { id: '3', mappingId: '01003', title: '낙뢰', icon: 'thunderstorm-outline', iconType: 'Ionicons' },
    { id: '4', mappingId: '01004', title: '대설', icon: 'weather-snowy-heavy', iconType: 'MaterialCommunityIcons' },
    { id: '5', mappingId: '01005', title: '산사태', icon: 'terrain', iconType: 'MaterialCommunityIcons' },
    { id: '6', mappingId: '01006', title: '우주전파재난', icon: 'radio', iconType: 'Ionicons' },
    { id: '7', mappingId: '01007', title: '자연우주물체추락', icon: 'planet', iconType: 'Ionicons' },
    { id: '8', mappingId: '01008', title: '적조', icon: 'leaf', iconType: 'Ionicons' },
    { id: '9', mappingId: '01009', title: '조류대발생(녹조)', icon: 'leaf', iconType: 'Ionicons' },
    { id: '10', mappingId: '01010', title: '조수', icon: 'water', iconType: 'Ionicons' },
    { id: '11', mappingId: '01011', title: '지진', icon: 'earthquake', iconType: 'MaterialCommunityIcons' },
    { id: '12', mappingId: '01012', title: '지진해일', icon: 'water', iconType: 'Ionicons' },
    { id: '13', mappingId: '01013', title: '침수', icon: 'flood', iconType: 'MaterialIcons' },
    { id: '14', mappingId: '01014', title: '태풍', icon: 'weather-hurricane', iconType: 'MaterialCommunityIcons' },
    { id: '15', mappingId: '01015', title: '폭염', icon: 'sunny-outline', iconType: 'Ionicons' },
    { id: '16', mappingId: '01016', title: '풍랑', icon: 'waves', iconType: 'MaterialCommunityIcons' },
    { id: '17', mappingId: '01017', title: '한파', icon: 'snow', iconType: 'Ionicons' },
    { id: '18', mappingId: '01018', title: '해일', icon: 'water', iconType: 'Ionicons' },
    { id: '19', mappingId: '01019', title: '호우', icon: 'rainy-outline', iconType: 'Ionicons' },
    { id: '20', mappingId: '01020', title: '홍수', icon: 'water', iconType: 'Ionicons' },
    { id: '21', mappingId: '01021', title: '화산폭발', icon: 'volcano', iconType: 'MaterialCommunityIcons' },
    { id: '22', mappingId: '01022', title: '황사', icon: 'weather-dust', iconType: 'MaterialCommunityIcons' },
];

  const allDisastersList = modalDataList.map(({ id, title }) => ({ id, title }));

  // 아이콘 컴포넌트를 동적으로 가져오는 함수
  const getIconComponent = (iconType, iconName, size = 35, color = 'black', style = {}) => {
    if (iconType === 'Ionicons') {
      return <Ionicons name={iconName} size={size} color={color} style={style} />;
    } else if (iconType === 'FontAwesome') {
      return <FontAwesome name={iconName} size={size} color={color} style={style} />;
    } else if (iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName} size={size} color={color} style={style} />;
    } else if (iconType === 'FontAwesome5') {
      return <FontAwesome5 name={iconName} size={size} color={color} style={style} />;
    } else {
      console.warn(`Unknown icon type: ${iconType}`);
      return null;
    }
  };

  // 재난의 선택 상태를 관리
  const handleDisasterSelection = (title) => {
    const updatedDisasters = { ...selectedDisasters };
    if (Object.values(updatedDisasters).includes(title)) {
      for (let key in updatedDisasters) {
        if (updatedDisasters[key] === title) {
          updatedDisasters[key] = '';
        }
      }
    } else {
      for (let key in updatedDisasters) {
        if (!updatedDisasters[key]) {
          updatedDisasters[key] = title;
          break;
        }
      }
    }
    setSelectedDisasters(updatedDisasters);
    setActiveDisasters(Object.values(updatedDisasters).filter(item => item));
  };

  // ApiScreen으로 이동하면서 mappingId 전달하는 함수
  const handleItemPress = (title) => {
    const selectedDisaster = modalDataList.find((item) => item.title === title);
    if (selectedDisaster) {
      navigation.navigate('ApiScreen', { mappingId: selectedDisaster.mappingId, category: 'naturaldisaster' });
    }
  };


  const getButtonStyle = (title) => {
    return activeDisasters.includes(title) ? { backgroundColor: '#B0E0E6' } : { backgroundColor: '#f0f0f0' };
  };

  const renderHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어를 입력하세요"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <MaterialIcons name="search" size={24} color="black" style={styles.searchIcon} />
      </View>

      <TouchableOpacity style={styles.settingsButton} onPress={() => setShowModal(true)}>
        <Ionicons name="settings-sharp" size={24} color="black" />
        <Text style={styles.settingsButtonText}>재난 설정</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton1)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton1)}
        >
          {getIconComponent(
            modalDataList.find(item => item.title === selectedDisasters.bigButton1)?.iconType || 'MaterialCommunityIcons',
            modalDataList.find(item => item.title === selectedDisasters.bigButton1)?.icon || 'cloud',
            65, 'black', styles.buttonIcon
          )}
          <Text style={styles.buttonText}>{selectedDisasters.bigButton1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton2)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton2)}
        >
          {getIconComponent(
            modalDataList.find(item => item.title === selectedDisasters.bigButton2)?.iconType || 'Ionicons',
            modalDataList.find(item => item.title === selectedDisasters.bigButton2)?.icon || 'cloud',
            65, 'black', styles.buttonIcon
          )}
          <Text style={styles.buttonText}>{selectedDisasters.bigButton2}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton3)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton3)}
        >
          {getIconComponent(
            modalDataList.find(item => item.title === selectedDisasters.bigButton3)?.iconType || 'Ionicons',
            modalDataList.find(item => item.title === selectedDisasters.bigButton3)?.icon || 'cloud',
            65, 'black', styles.buttonIcon
          )}
          <Text style={styles.buttonText}>{selectedDisasters.bigButton3}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton4)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton4)}
        >
          {getIconComponent(
            modalDataList.find(item => item.title === selectedDisasters.bigButton4)?.iconType || 'Ionicons',
            modalDataList.find(item => item.title === selectedDisasters.bigButton4)?.icon || 'cloud',
            65, 'black', styles.buttonIcon
          )}
          <Text style={styles.buttonText}>{selectedDisasters.bigButton4}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.showAllButton} onPress={() => setShowList(!showList)}>
        <Text style={styles.showAllButtonText}>전체보기</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 15 }}
        data={showList ? allDisastersList : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItemButton} onPress={() => handleItemPress(item.title)}>
            <Text style={styles.cellText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        )}
        numColumns={3}
        ListHeaderComponent={renderHeader}
      />

      {/* 모달 */}
      <Modal visible={showModal} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>재난 설정</Text>
                <ScrollView contentContainerStyle={styles.iconGrid}>
                  {modalDataList.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.iconButton, getButtonStyle(item.title)]}
                      onPress={() => handleDisasterSelection(item.title)}
                    >
                      {getIconComponent(item.iconType, item.icon)}
                      <Text style={styles.iconText}>{item.title}</Text>
                      {activeDisasters.includes(item.title) && (
                        <Text style={styles.positionIndicator}>{activeDisasters.indexOf(item.title) + 1}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  searchIcon: {
    marginLeft: 5,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  settingsButtonText: {
    color: '#808080',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bigButton: {
    flex: 1,
    backgroundColor: '#B0E0E6',
    paddingVertical: 60,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    position: 'relative',
    width: 130,
    height: 130,
  },
  buttonIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 20,
  },
  showAllButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  showAllButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  listItemButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  cellText: {
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: '30%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  iconText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  positionIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 10,
    color: '#000',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen;

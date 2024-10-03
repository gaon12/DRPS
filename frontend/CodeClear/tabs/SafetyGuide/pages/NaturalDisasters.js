import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // 아이콘을 위한 라이브러리

const App = () => {
  const [showList, setShowList] = useState(false);
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [searchText, setSearchText] = useState('');

  // 디폴트로 설정된 재난 항목 (태풍, 호우, 폭염, 한파)
  const [selectedDisasters, setSelectedDisasters] = useState({
    bigButton1: '태풍',
    bigButton2: '호우',
    bigButton3: '폭염',
    bigButton4: '한파',
  });

  const [activeDisasters, setActiveDisasters] = useState([
    '태풍', '호우', '폭염', '한파'
  ]); // 디폴트 값으로 태풍, 호우, 폭염, 한파가 선택된 상태

  // 재난 설정 모달에서 사용할 데이터 (아이콘 포함)
  const modalDataList = [
    { id: '1', title: '침수', icon: 'water' },
    { id: '2', title: '태풍', icon: 'storm' },
    { id: '3', title: '호우', icon: 'rainy-outline' },
    { id: '4', title: '낙뢰', icon: 'flash' },
    { id: '5', title: '강풍', icon: 'weather-windy' },
    { id: '6', title: '풍랑', icon: 'waves' },
    { id: '7', title: '대설', icon: 'snowflake' },
    { id: '8', title: '한파', icon: 'snow-outline' },
    { id: '9', title: '폭염', icon: 'sunny-outline' },
    { id: '10', title: '황사', icon: 'partly-sunny-outline' },
    { id: '11', title: '지진', icon: 'earth' },
    { id: '12', title: '해일', icon: 'water' },
    { id: '13', title: '지진해일', icon: 'water' },
    { id: '14', title: '화산폭발', icon: 'flame' },
    { id: '15', title: '가뭄', icon: 'sunny' },
    { id: '16', title: '홍수', icon: 'water' },
    { id: '17', title: '조수', icon: 'waves' },
    { id: '18', title: '산사태', icon: 'terrain' },
    { id: '19', title: '자연우주물체추락', icon: 'planet' },
    { id: '20', title: '우주전파재난', icon: 'radio' },
    { id: '21', title: '조류대발생(녹조)', icon: 'leaf' },
    { id: '22', title: '적조', icon: 'leaf' },
  ];

  // 전체보기 탭에서 사용할 데이터 (아이콘 없음)
  const allDisastersList = modalDataList.map(({ id, title }) => ({ id, title }));

  // 설정을 누르면 해당 버튼에 반영
  const handleItemPress = (title) => {
    // 4개 모두 선택된 경우 추가 선택 방지
    if (activeDisasters.length === 4 && !activeDisasters.includes(title)) {
      return; // 선택할 수 없음
    }

    setSelectedDisasters((prevState) => {
      const updatedDisasters = { ...prevState };
      if (activeDisasters.includes(title)) {
        // 이미 선택된 재난을 비활성화할 때
        setActiveDisasters((prevList) => prevList.filter((disaster) => disaster !== title));
        const buttonKey = Object.keys(updatedDisasters).find(key => updatedDisasters[key] === title);
        if (buttonKey) {
          updatedDisasters[buttonKey] = '';
        }
      } else {
        // 새로운 재난 선택 시
        const buttonKey = Object.keys(updatedDisasters).find(key => updatedDisasters[key] === '');
        if (buttonKey) {
          updatedDisasters[buttonKey] = title;
          setActiveDisasters((prevList) => [...prevList, title]);
        }
      }
      return updatedDisasters;
    });
  };

  // title을 받아 해당 아이콘을 반환하는 함수
  const getIconForDisaster = (title) => {
    const disaster = modalDataList.find(item => item.title === title);
    return disaster ? disaster.icon : 'help'; // 아이콘이 없을 경우 기본값으로 'help' 사용
  };

  const renderHeader = () => (
    <>
      {/* 검색창 + 돋보기 아이콘 추가 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어를 입력하세요"
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
        <MaterialIcons name="search" size={24} color="black" style={styles.searchIcon} />
      </View>

      {/* 재난 설정 버튼 */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => setShowModal(true)}>
        <Ionicons name="settings-sharp" size={24} color="black" style={styles.settingsIcon} />
        <Text style={styles.settingsButtonText}>재난 설정</Text>
      </TouchableOpacity>

      {/* 4개의 큰 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name={getIconForDisaster(selectedDisasters.bigButton1)} size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton1}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name={getIconForDisaster(selectedDisasters.bigButton2)} size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton2}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name={getIconForDisaster(selectedDisasters.bigButton3)} size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton3}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name={getIconForDisaster(selectedDisasters.bigButton4)} size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton4}</Text>
        </TouchableOpacity>
      </View>

      {/* 전체보기 버튼 */}
      <TouchableOpacity style={styles.showAllButton} onPress={() => setShowList(!showList)}>
        <Text style={styles.showAllButtonText}>전체보기</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 15 }}
        data={showList ? allDisastersList : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItemButton}
            onPress={() => console.log(item.title)} // 전체보기 탭에서는 클릭 시 로그만 출력
          >
            <Text style={styles.cellText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        )}
        numColumns={3}  // 한 줄에 3개의 아이콘 배치
        ListHeaderComponent={renderHeader} // 헤더 추가
      />

      {/* 재난 설정 모달 구현 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>재난 설정</Text>
                {/* 아이콘을 작은 크기로 여러 개 배치 (한 줄에 3개씩) */}
                <ScrollView contentContainerStyle={styles.iconGrid}>
                  {modalDataList.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.iconButton,
                        activeDisasters.includes(item.title) ? styles.selectedItem : null
                      ]}
                      onPress={() => handleItemPress(item.title)}
                    >
                      <Ionicons name={item.icon} size={35} color="black" />
                      <Text style={styles.iconText}>{item.title}</Text>
                      {/* 항목이 선택된 경우 우상단에 해당 항목이 몇 번째 버튼에 있는지 표시 */}
                      {activeDisasters.includes(item.title) && (
                        <Text style={styles.positionIndicator}>
                          {Object.keys(selectedDisasters).findIndex(key => selectedDisasters[key] === item.title) + 1}
                        </Text>
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
  container: {
    flex: 1,  
    backgroundColor: '#fff',
  },
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
  settingsIcon: {
    marginRight: 5,
    fontSize: 14,
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
    width: '30%',  // 한 줄에 3개의 버튼이 배치되도록 설정
    height: 80,  // 버튼 높이
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',  // 버튼의 배경색을 약간 회색으로 설정
    borderWidth: 1,  // 테두리 설정
    borderColor: '#ccc',  // 테두리 색상
    borderRadius: 10,  // 테두리 둥글게 설정
  },
  iconText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  selectedItem: {
    backgroundColor: '#B0E0E6',
    borderRadius: 10,
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

export default App;

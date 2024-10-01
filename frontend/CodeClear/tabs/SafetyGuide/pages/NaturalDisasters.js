import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet, } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // 아이콘을 위한 라이브러리

const App = () => {
  const [showList, setShowList] = useState(false);
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태 추가
  const [searchText, setSearchText] = useState('');

  // 리스트 데이터
  const dataList = [
    { id: '1', title: '홍수' },
    { id: '2', title: '태풍' },
    { id: '3', title: '호우' },
    { id: '4', title: '낙뢰' },
    { id: '5', title: '강풍' },
    { id: '6', title: '풍랑' },
    { id: '7', title: '대설' },
    { id: '8', title: '한파' },
    { id: '9', title: '폭염' },
    { id: '10', title: '황사' },
    { id: '11', title: '지진' },
    { id: '12', title: '해일' },
    { id: '13', title: '지진해일' },
    { id: '14', title: '화산폭발' },
    { id: '15', title: '가뭄' },
    { id: '16', title: '홍수' },
    { id: '17', title: '조수' },
    { id: '18', title: '산사태' },
    { id: '19', title: '자연우주물체추락' },
    { id: '20', title: '우주전파재난' },
    { id: '21', title: '조류대발생(녹조)' },
    { id: '22', title: '적조' },
  ];

  const handleItemPress = (title) => {
    // 클릭 시 처리할 로직
    console.log(`${title} 항목을 눌렀습니다!`);
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
          <MaterialIcons name="storm" size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>태풍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name="rainy-outline" size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>호우</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name="sunny-outline" size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>폭염</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bigButton}>
          <Ionicons name="snow-outline" size={65} color="black" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>한파</Text>
        </TouchableOpacity>
      </View>

      {/* 전체보기 버튼 */}
      <TouchableOpacity style={styles.showAllButton} onPress={() => setShowList(!showList)}>
        <Text style={styles.showAllButtonText}>전체보기</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 15 }} // 양쪽 끝에 여백을 추가
        data={showList ? dataList : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItemButton}
            onPress={() => handleItemPress(item.title)}
          >
            <Text style={styles.cellText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        )}
        numColumns={3}
        ListHeaderComponent={renderHeader} // 헤더 추가
      />

      {/* 모달 구현 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        {/* 모달 바깥을 눌렀을 때 모달 닫기 */}
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            {/* 모달 내부는 닫히지 않도록 View로 감싸기 */}
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>전체 재난 리스트</Text>
                {/* ScrollView로 감싸서 슬라이드 기능 추가 */}
                <ScrollView>
                  {dataList.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.listItemButton}
                      onPress={() => handleItemPress(item.title)}
                    >
                      <Text style={styles.cellText}>{item.title}</Text>
                      <MaterialIcons name="chevron-right" size={24} color="black" />
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10, // 양쪽에 여백 추가
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10, // 검색창과 아래 버튼 사이의 간격
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
    marginRight: 5, // 아이콘과 텍스트 사이의 간격
    fontSize: 14,
  },
  settingsButton: {
    flexDirection: 'row', // 아이콘과 텍스트를 가로로 배치
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-end', // 오른쪽 정렬
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1, // 검정색 테두리 추가
    borderColor: '#000', // 검정색 테두리
  },
  settingsButtonText: {
    color: '#808080', // 회색 폰트 색상
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row', // 가로로 버튼들을 배치
    justifyContent: 'space-between',
    marginBottom: 20, // 버튼 사이 세로 간격 증가
  },
  bigButton: {
    flex: 1,
    backgroundColor: '#B0E0E6', // 버튼 색상
    paddingVertical: 60, // 버튼 세로 크기
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start', // 아이콘과 텍스트 배치를 시작 위치로 조정
    borderRadius: 10,
    position: 'relative',
  },
  buttonIcon: {
    position: 'absolute',
    top: 10, // 아이콘을 상단에 위치
    left: 10, // 아이콘을 좌측에 위치
  },
  buttonText: {
    color: '#000', // 검정색 텍스트
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10, // 텍스트를 아래로 이동
    right: 10,  // 텍스트를 좌측으로 이동
    fontSize: 20,
  },
  showAllButton: {
    backgroundColor: '#fff', // 흰색 배경
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginBottom: 10,
    // 그림자 효과 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3, // Android에서 그림자 효과
  },
  showAllButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  listItemButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 10, // 양쪽 여백 추가
    marginVertical: 5,    // 세로 여백
  },
  cellText: {
    fontSize: 16,
    textAlign: 'center',
  },
  invisibleItem: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%', // 최대 높이를 설정해서 화면에 맞추기
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android에서 그림자 효과
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
    color: '#000',
  },
});

export default App;

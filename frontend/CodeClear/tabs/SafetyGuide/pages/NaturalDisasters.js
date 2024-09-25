import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // 아이콘을 위한 라이브러리

const App = () => {
  const [showList, setShowList] = useState(false);
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
  ];

  // 데이터를 3개씩 나누는 로직
  const formatData = (data, numColumns) => {
    const totalRows = Math.floor(data.length / numColumns);
    let totalLastRow = data.length - (totalRows * numColumns);

    while (totalLastRow !== 0 && totalLastRow !== numColumns) {
      data.push({ id: `blank-${totalLastRow}`, title: '', empty: true });
      totalLastRow++;
    }
    return data;
  };

  const handleItemPress = (title) => {
    // 클릭 시 처리할 로직
    console.log(`${title} 항목을 눌렀습니다!`);
  };

  return (
    <View style={styles.container}>
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
      <TouchableOpacity style={styles.settingsButton} onPress={() => console.log('재난 설정')}>
        <Ionicons name="settings-sharp" size={24} color="black" style={styles.settingsIcon} />
        <Text style={styles.settingsButtonText}>재난 설정</Text>
      </TouchableOpacity>

      {/* 4개의 큰 버튼 */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.bigButton}>
            <Text style={styles.buttonText}>범죄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigButton}>
            <Text style={styles.buttonText}>화재</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.bigButton}>
            <Text style={styles.buttonText}>구조/구급</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigButton}>
            <Text style={styles.buttonText}>해양사고</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 전체보기 버튼 */}
      <TouchableOpacity style={styles.showAllButton} onPress={() => setShowList(!showList)}>
        <Text style={styles.showAllButtonText}>전체보기</Text>
      </TouchableOpacity>

      {/* 3개씩 리스트 출력 */}
      {showList && (
        <FlatList
          data={formatData(dataList, 3)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item.empty) {
              return <View style={[styles.listItemButton, styles.invisibleItem]} />;
            }
            return (
              <TouchableOpacity
                style={styles.listItemButton}
                onPress={() => handleItemPress(item.title)} // 터치 시 로직 추가
              >
                <Text style={styles.cellText}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={24} color="black" />
              </TouchableOpacity>
            );
          }}
          numColumns={3}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10, // 검색창과 아래 버튼 사이의 간격
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
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // 버튼 사이 세로 간격 증가
  },
  bigButton: {
    flex: 1,
    backgroundColor: '#B0E0E6', // 버튼 색상
    paddingVertical: 60, // 버튼 세로 크기 증가
    marginHorizontal: 10, 
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    margin: 5,
  },
  cellText: {
    fontSize: 16,
    textAlign: 'center',
  },
  invisibleItem: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});

export default App;

import React, { useState } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from './DisasterGuideStyle';

const images = {
  '01001.png': require('./icon_pic/NaturalDisasters/01001.png'),
  '01002.png': require('./icon_pic/NaturalDisasters/01002.png'),
  '01003.png': require('./icon_pic/NaturalDisasters/01003.png'),
  '01004.png': require('./icon_pic/NaturalDisasters/01004.png'),
  '01005.png': require('./icon_pic/NaturalDisasters/01005.png'),
  '01006.png': require('./icon_pic/NaturalDisasters/01006.png'),
  '01007.png': require('./icon_pic/NaturalDisasters/01007.png'),
  '01008.png': require('./icon_pic/NaturalDisasters/01008.png'),
  '01009.png': require('./icon_pic/NaturalDisasters/01009.png'),
  '01010.png': require('./icon_pic/NaturalDisasters/01010.png'),
  '01011.png': require('./icon_pic/NaturalDisasters/01011.png'),
  '01012.png': require('./icon_pic/NaturalDisasters/01012.png'),
  '01013.png': require('./icon_pic/NaturalDisasters/01013.png'),
  '01014.png': require('./icon_pic/NaturalDisasters/01014.png'),
  '01015.png': require('./icon_pic/NaturalDisasters/01015.png'),
  '01016.png': require('./icon_pic/NaturalDisasters/01016.png'),
  '01017.png': require('./icon_pic/NaturalDisasters/01017.png'),
  '01018.png': require('./icon_pic/NaturalDisasters/01018.png'),
  '01019.png': require('./icon_pic/NaturalDisasters/01019.png'),
  '01020.png': require('./icon_pic/NaturalDisasters/01020.png'),
  '01021.png': require('./icon_pic/NaturalDisasters/01021.png'),
  '01022.png': require('./icon_pic/NaturalDisasters/01022.png'),
};

const NaturalDisasters = ({ navigation }) => {
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
    { id: '1', mappingId: '01001', title: '가뭄', imgName: '01001.png' },
    { id: '2', mappingId: '01002', title: '강풍', imgName: '01002.png' },
    { id: '3', mappingId: '01003', title: '낙뢰', imgName: '01003.png' },
    { id: '4', mappingId: '01004', title: '대설', imgName: '01004.png' },
    { id: '5', mappingId: '01005', title: '산사태', imgName: '01005.png' },
    { id: '6', mappingId: '01006', title: '우주전파재난', imgName: '01006.png' },
    { id: '7', mappingId: '01007', title: '자연우주물체추락', imgName: '01007.png' },
    { id: '8', mappingId: '01008', title: '적조', imgName: '01008.png' },
    { id: '9', mappingId: '01009', title: '조류대발생(녹조)', imgName: '01009.png' },
    { id: '10', mappingId: '01010', title: '조수', imgName: '01010.png' },
    { id: '11', mappingId: '01011', title: '지진', imgName: '01011.png' },
    { id: '12', mappingId: '01012', title: '지진해일', imgName: '01012.png' },
    { id: '13', mappingId: '01013', title: '침수', imgName: '01013.png' },
    { id: '14', mappingId: '01014', title: '태풍', imgName: '01014.png' },
    { id: '15', mappingId: '01015', title: '폭염', imgName: '01015.png' },
    { id: '16', mappingId: '01016', title: '풍랑', imgName: '01016.png' },
    { id: '17', mappingId: '01017', title: '한파', imgName: '01017.png' },
    { id: '18', mappingId: '01018', title: '해일', imgName: '01018.png' },
    { id: '19', mappingId: '01019', title: '호우', imgName: '01019.png' },
    { id: '20', mappingId: '01020', title: '홍수', imgName: '01020.png' },
    { id: '21', mappingId: '01021', title: '화산폭발', imgName: '01021.png' },
    { id: '22', mappingId: '01022', title: '황사', imgName: '01022.png' },
  ];

  const getImageSource = (imgName) => {
    if (images[imgName]) {
      return images[imgName];
    } else {
      console.warn(`Image not found for: ${imgName}`);
      return null;
    }
  };

  const allDisastersList = modalDataList.map(({ id, title }) => ({ id, title }));

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
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton1)?.imgName
            )}
            style={styles.bigButtonImage} // 이미지 스타일 추가
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton2)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton2)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton2)?.imgName
            )}
            style={styles.bigButtonImage}
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton2}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton3)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton3)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton3)?.imgName
            )}
            style={styles.bigButtonImage}
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton3}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, getButtonStyle(selectedDisasters.bigButton4)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton4)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton4)?.imgName
            )}
            style={styles.bigButtonImage}
          />
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
                      <Image
                        source={getImageSource(item.imgName)}
                        style={styles.modalImage} // 이미지 스타일 추가
                      />
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

export default NaturalDisasters;

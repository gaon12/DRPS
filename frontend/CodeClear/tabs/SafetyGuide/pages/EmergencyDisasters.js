import React, { useState } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from './DisasterGuideStyle';

const images = {
	'04001.png': require('./icon_pic/EmergencyDisasters/04001.png'),
	'04002.png': require('./icon_pic/EmergencyDisasters/04002.png'),
	'04003.png': require('./icon_pic/EmergencyDisasters/04003.png'),
	'04004.png': require('./icon_pic/EmergencyDisasters/04004.png'),
};


const EmergencyDisasters = ({ navigation }) => {
  const [showList, setShowList] = useState(false); // 전체보기 리스트 표시 여부
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [searchText, setSearchText] = useState('');
  const [selectedDisasters, setSelectedDisasters] = useState({
    bigButton1: '민방공',
    bigButton2: '비상대비물자',
    bigButton3: '비상사태',
    bigButton4: '화생방무기',
  });
  const [activeDisasters, setActiveDisasters] = useState(['민방공', '비상대비물자', '비상사태', '화생방무기']);

  // 재난 정보와 매핑되는 ID 리스트
  const modalDataList = [
    { id: '1', mappingId: '04001', title: '민방공', imgName: '04001.png' },
    { id: '2', mappingId: '04002', title: '비상대비물자', imgName: '04002.png' },
    { id: '3', mappingId: '04003', title: '비상사태', imgName: '04003.png' },
    { id: '4', mappingId: '04004', title: '화생방무기', imgName: '04004.png' },
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
      navigation.navigate('ApiScreen', { mappingId: selectedDisaster.mappingId, category: 'lifesafety' });
    }
  };

  const getButtonStyle = (title) => {
    return activeDisasters.includes(title) ? { backgroundColor: '#FFB6C1' } : { backgroundColor: '#f0f0f0' };
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
          style={[styles.bigButton_e, getButtonStyle(selectedDisasters.bigButton1)]}
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
          style={[styles.bigButton_e, getButtonStyle(selectedDisasters.bigButton2)]}
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
          style={[styles.bigButton_e, getButtonStyle(selectedDisasters.bigButton3)]}
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
          style={[styles.bigButton_e, getButtonStyle(selectedDisasters.bigButton4)]}
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

export default EmergencyDisasters;

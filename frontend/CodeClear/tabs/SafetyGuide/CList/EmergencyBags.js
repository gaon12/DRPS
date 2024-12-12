import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const ChecklistItem = ({ title }) => {
  const [checked, setChecked] = useState(false);
  const [isMemoVisible, setMemoVisible] = useState(false);  // 메모 모달 상태
  const [memoText, setMemoText] = useState('');  // 메모 텍스트 상태
  const [isMemoSaved, setMemoSaved] = useState(false);  // 메모 저장 여부
  const [isCalendarVisible, setCalendarVisible] = useState(false);  // 캘린더 모달 상태
  const [dueDate, setDueDate] = useState(null);  // 기한 설정 상태
  const [currentTitle, setCurrentTitle] = useState('');  // 현재 메모를 편집 중인 리스트 제목

  // 메모 저장 핸들러
  const handleMemoSave = () => {
    if (memoText.trim().length > 0) {
      setMemoSaved(true);  // 메모가 작성되었음을 표시
    } else {
      setMemoSaved(false);  // 메모가 비어 있으면 다시 저장 해제
    }
    setMemoVisible(false);  // 메모 모달 닫기
  };

  // 메모 열기 핸들러
  const openMemoModal = (title) => {
    setCurrentTitle(title);  // 현재 편집 중인 리스트 제목 설정
    setMemoVisible(true);  // 메모 모달 열기
  };

  // 캘린더 핸들러
  const handleConfirm = (date) => {
    setDueDate(date.toLocaleDateString());  // 선택한 날짜 저장
    setCalendarVisible(false);  // 캘린더 모달 닫기
  };

  // 캘린더 초기화 핸들러
  const handleResetDate = () => {
    setDueDate(null);  // 날짜 초기화
    setCalendarVisible(false);  // 캘린더 모달 닫기
  };

  return (
    <View style={styles.checklistItem}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setChecked(!checked)}>
          <FontAwesome 
            name={checked ? 'check-square-o' : 'square-o'} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="question-circle" size={24} color="gray" />
        </TouchableOpacity>
      </View>

		{/* 메모 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.memoButton}
          onPress={() => openMemoModal(title)}
        >
          <MaterialIcons 
            name="edit" 
            size={20} 
            color={isMemoSaved ? 'blue' : 'gray'}  // 메모가 저장되면 파란색으로 변경
          />
          <Text style={[styles.buttonText, isMemoSaved && { color: 'blue' }]}>메모 편집</Text>  
        </TouchableOpacity>

        {/* 기한 설정 버튼 */}
        <TouchableOpacity style={styles.deadlineButton} onPress={() => setCalendarVisible(true)}>
          <Text style={[styles.buttonText, dueDate ? { color: 'red' } : { color: 'gray' }]}>
            {dueDate ? dueDate : '기한 미설정'}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={dueDate ? 'red' : 'gray'} />  
        </TouchableOpacity>
      </View>

      {/* 메모 모달 */}
      <Modal visible={isMemoVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.memoModal}>
            <Text style={styles.modalTitle}>메모 편집</Text>
            <Text style={styles.currentListTitle}>{currentTitle}</Text>  
            <TextInput
              style={styles.memoInput}
              value={memoText}
              onChangeText={(text) => setMemoText(text)}
              placeholder="메모를 입력하세요"
            />
            <View style={styles.memoActions}>
              <TouchableOpacity onPress={() => setMemoVisible(false)}>
                <Text style={styles.cancelButton}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMemoSave}>
                <Text style={styles.saveButton}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 캘린더 모달 */}
      <DateTimePickerModal
        isVisible={isCalendarVisible}
        mode="date"
        onConfirm={handleConfirm}  // 날짜 선택 후 호출
        onCancel={() => setCalendarVisible(false)}  // 모달 닫기
        customCancelButtonIOS={
          <TouchableOpacity style={styles.resetButton} onPress={handleResetDate}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
        }  // 초기화 버튼 추가
      />
    </View>
  );
};

const AccordionItem = ({ sectionTitle, checklistItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{sectionTitle}</Text>
        <FontAwesome name={isOpen ? 'minus' : 'plus'} size={24} color="black" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.checklistContainer}>
          {checklistItems.map((item, index) => (
            <ChecklistItem key={index} title={item} />
          ))}
        </View>
      )}
    </View>
  );
};

const AccordionChecklist = () => {
  const sections = [
    {
      title: '가방에 넣어두면 편리',
      items: ['들고 이동하기 편한 가방', '항상 여행에 가져가는 물건'],
    },
    {
      title: '귀가 곤란을 상정한 대비',
      items: ['비상약', '응급 처치 도구'],
    },
    {
      title: '안전성이 높은 외출 스타일',
      items: ['야광 조끼', '안전화'],
    },
    {
      title: '임신 중에 필요한 아이템',
      items: ['임산부 안전벨트', '필수 영양제'],
    },
    {
      title: '아기와의 외출',
      items: ['아기용품 가방', '기저귀', '젖병'],
    },
    {
      title: '비상식품',
      items: ['장난감', '간식'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          sectionTitle={section.title}
          checklistItems={section.items}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  accordionContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistContainer: {
    marginTop: 10,
  },
  checklistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  memoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    width: '48%',  // 전체의 48%씩 차지
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    width: '48%',  // 전체의 48%씩 차지
    justifyContent: 'space-between',  // 텍스트와 아이콘 간 간격 유지
  },
  buttonText: {
    marginLeft: 5,
    color: 'gray',
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  memoModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentListTitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
    alignSelf: 'flex-start',  // 좌측 정렬
  },
  memoInput: {
    height: 100,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  memoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    color: 'red',
  },
  saveButton: {
    color: 'blue',
  },
  resetButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  resetText: {
    color: 'blue',
  },
});

export default AccordionChecklist;

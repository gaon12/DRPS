import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VersionDetails = ({ route }) => {
  // route.params가 없을 경우 기본값 설정
  const { version } = route?.params || { version: 'N/A' };

  return (
    <View style={styles.container}>
      <Text style={styles.versionText}>Version: {version}</Text>
      {/* 추가 정보는 여기에 나중에 추가 가능 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VersionDetails;

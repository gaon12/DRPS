import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';

const ExamplePage3 = () => {
  // YouTube 임베드를 위한 HTML 컨텐츠
  const youtubeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; }
          .video-container {
            position: relative;
            padding-bottom: 65%;
            height: 0;
            overflow: hidden;
          }
          .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <iframe 
            src="https://www.youtube.com/embed/Eg5FAr8n-KM?playsinline=1"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  `;

  // 마크다운 내용
  const markdownContent = `
# 불 피우기

야외에서 필수적인 불 피우기 기술을 익히면 생존에 큰 도움이 됩니다. 불 피우기 전문가가 되는 몇 가지 팁을 소개합니다.

---

#### 불 피우기 기술  
불 피우기 도구, 마찰 불, 부싯돌과 강철 등 다양한 불 피우기 방법을 익히세요. 반복 연습으로 기술과 자신감을 키우세요.

#### 필수적인 불 피우기 도구  
라이터, 성냥, 불 피우기 도구와 같은 생존 필수품을 키트에 항상 준비하세요. 이 도구들은 불 피우기의 성공 확률을 높입니다.

#### 지속 가능한 불 피우기  
건조한 나뭇가지, 잎, 작은 나뭇조각을 모아 불을 지피세요. 공기 흐름을 고려해 천막이나 통나무집 형태로 배치하면 불이 오래 유지됩니다.

#### 화재 안전 예방 조치  
안전이 가장 중요합니다. 화재 주변의 가연성 물질을 치우고 비상용 물통을 준비하세요. 불은 절대 방치하지 말고, 완전히 꺼졌는지 확인하세요.

#### 다양한 날씨 조건에서 불 피우기  
비나 강풍 같은 날씨에 맞춰 불 피우기 전략을 조정하세요. 보호 구역을 찾고 추가 도구를 활용해 불을 피우세요.

---

불 피우기 기술은 생존에 필수적이므로 꾸준히 연습하여 익숙해지세요.

  `;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.embedContainer}>
          <WebView
            style={styles.webview}
            source={{ html: youtubeHTML }}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
          />
        </View>
        <View style={styles.markdownContainer}>
          <Markdown>{markdownContent}</Markdown>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  embedContainer: {
    height: 220, // 고정된 높이 설정
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  markdownContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
});

export default ExamplePage3;

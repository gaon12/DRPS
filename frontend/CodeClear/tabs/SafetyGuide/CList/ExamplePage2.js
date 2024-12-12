import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';

const ExamplePage2 = () => {
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
            src="https://www.youtube.com/embed/QXF86GqUbtY?playsinline=1"
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
  # 식수 확보

### 신뢰할 수 있는 물 공급원 확보 및 정화 방법

비상 상황에서 생존하기 위해 신뢰할 수 있는 물 공급원을 확보하고 이를 정화하는 것은 필수적입니다. 수분을 공급하고 수인성 질병을 예방하기 위해 다음과 같은 핵심 사항을 숙지하세요.

---

#### 물 여과 방법  
휴대용 정수 필터를 사용하거나 물을 끓여서 불순물을 제거하세요. 이렇게 하면 안전하게 마실 수 있습니다.

#### 비상용 물 공급원  
강, 호수, 빗물 등 주변의 잠재적 비상용 물 공급원을 알아두세요. 물의 품질을 평가한 후 마시세요.

#### 수분 공급의 중요성  
수분을 유지하면 체온을 조절하고 인지 기능을 개선하며 신체 성능을 유지할 수 있습니다.

#### 수인성 질병  
처리되지 않은 물을 마시면 콜레라나 지아르디아 같은 위험한 수인성 질병에 걸릴 수 있습니다. 반드시 물을 정화하세요.

#### 직접 정수하기  
정수 필터가 없을 때는 천이나 반다나로 이물질을 걸러내고, 물을 끓이거나 정수 정제 태블릿을 사용해 정수하세요.

---

정확한 정수법을 이해하고 실행하면 비상 상황에서도 건강을 유지할 수 있습니다.
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

export default ExamplePage2;

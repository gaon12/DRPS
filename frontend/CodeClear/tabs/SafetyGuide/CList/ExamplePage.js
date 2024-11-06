import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';

const ExamplePage = () => {
  const [markdownContent, setMarkdownContent] = useState('');

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
            src="https://www.youtube.com/embed/LJJFIX1y1Mw?playsinline=1"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  `;

  useEffect(() => {
    fetch('https://apis.uiharu.dev/drps/test/a.md')
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(error => console.error(error));
  }, []);

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
          <Text style={styles.sectionTitle}></Text>
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
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  markdownContainer: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});

export default ExamplePage;

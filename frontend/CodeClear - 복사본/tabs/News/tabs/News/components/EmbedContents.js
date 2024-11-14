import React from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { Linking } from "react-native";

const EmbedContents = ({ text, isDarkMode, styles, darkStyles }) => {
	const linkPattern = /\[https?:\/\/[^\]]+\]/g;

	// Define platforms and their patterns
	const platforms = [
		{
			name: "YouTube",
			pattern: /(youtube\.com\/.*[?&]v=|youtu\.be\/|music\.youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]+)/,
			getEmbedUrl: videoId => `https://www.youtube.com/embed/${videoId}`
		},
		{
			name: "NaverTV",
			pattern: /tv\.naver\.com\/(?:v|embed)\/(\d+)/,
			getEmbedUrl: videoId => `https://tv.naver.com/embed/${videoId}`
		},
		{
			name: "KakaoTV",
			pattern: /tv\.kakao\.com\/(?:v\/|channel\/\d+\/cliplink\/|embed\/player\/cliplink\/)(\d+)/,
			getEmbedUrl: videoId => `https://play-tv.kakao.com/embed/player/cliplink/${videoId}`
		},
		{
			name: "Vimeo",
			pattern: /vimeo\.com\/(?:video\/|)(\d+)/,
			getEmbedUrl: videoId => `https://player.vimeo.com/video/${videoId}`
		}
	];

	// Function to render WebView for video embeds
	const renderVideo = (videoUrl, key) => (
		<View key={key} style={styles.videoContainer}>
			<WebView style={styles.video} source={{ uri: videoUrl }} allowsFullscreenVideo />
		</View>
	);

	// Function to handle individual links
	const handleLink = (url, index, idx) => {
		for (const platform of platforms) {
			const match = url.match(platform.pattern);
			if (match) {
				const videoId = match[match.length - 1]; // Extract videoId
				return renderVideo(platform.getEmbedUrl(videoId), `${platform.name}-${index}-${idx}`);
			}
		}
		// Default case for non-video links
		return (
			<Text key={`link-${index}-${idx}`} style={isDarkMode ? darkStyles.link : styles.link} onPress={() => Linking.openURL(url)}>
				링크 열기
			</Text>
		);
	};

	return text.split("\n").map((line, index) => {
		const matches = line.match(linkPattern);

		return (
			<View key={`line-${index}`}>
				{/* Render the text line */}
				<Text style={isDarkMode ? darkStyles.body : styles.body}>{line.replace(linkPattern, "").trim()}</Text>
				{/* Render links or videos */}
				{matches && matches.map((link, idx) => handleLink(link.replace(/[\[\]]/g, ""), index, idx))}
			</View>
		);
	});
};

export default EmbedContents;

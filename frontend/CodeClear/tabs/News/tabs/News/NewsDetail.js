import React, { useContext, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { SettingsContext } from "../../../../Context";
import { Provider } from "react-native-paper";
import useNewsData from "./hooks/useNewsData";
import { handleShare } from "./hooks/handleShare";
import { handleTTS } from "./hooks/handleTTS";
import { handleSummary } from "./hooks/handleSummary";
import SummaryModal from "./components/SummaryModal";
import EmbedContents from "./components/EmbedContents";

const NewsDetail = () => {
	const route = useRoute();
	const { yna_no } = route.params;
	const { newsData, loading, error, settingsLang } = useNewsData(yna_no);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [visible, setVisible] = useState(false);
	const [summaryText, setSummaryText] = useState([]);
	const [currentSummary, setCurrentSummary] = useState(0);
	const { settings } = useContext(SettingsContext);
	const isDarkMode = settings.isDarkMode;

	const showModal = () => setVisible(true);
	const hideModal = () => setVisible(false);

	const extractNonQuoteContent = (formattedContent) => {
		return formattedContent
			.filter(item => item.type !== "quote")
			.map(item => item.text)
			.join("\n");
	};

	const showSummary = async () => {
		try {
			const nonQuoteContent = extractNonQuoteContent(newsData.formattedContent);
			const summaries = await handleSummary({ ...newsData, formattedContent: [{ text: nonQuoteContent, type: "text" }] });
			setSummaryText(summaries);
			setCurrentSummary(0);
			showModal();
		} catch (error) {
			console.error("Error in showSummary:", error);
			setSummaryText(["요약에 실패했습니다. 다시 시도해주세요."]);
			setCurrentSummary(0);
			showModal();
		}
	};

	const nextSummary = () => {
		setCurrentSummary(prev => (prev + 1) % summaryText.length);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	if (!newsData) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>뉴스 데이터를 찾을 수 없습니다.</Text>
			</View>
		);
	}

	return (
		<Provider>
			<ScrollView
				contentContainerStyle={isDarkMode ? darkStyles.container : styles.container}
				style={isDarkMode ? darkStyles.scrollView : styles.scrollView}
			>
				<Text style={isDarkMode ? darkStyles.title : styles.title}>{newsData.yna_ttl}</Text>
				<View style={isDarkMode ? darkStyles.metaContainer : styles.metaContainer}>
					<Text style={isDarkMode ? darkStyles.subtitle : styles.subtitle}>
						{newsData.yna_reg_ymd} | {newsData.team_nm}
					</Text>
					<View style={styles.iconContainer}>
						<TouchableOpacity onPress={() => handleShare(newsData)} style={styles.iconButton}>
							<MaterialIcons name="share" size={20} color={isDarkMode ? "#fff" : "black"} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => handleTTS(isSpeaking, setIsSpeaking, newsData, settingsLang)} style={styles.iconButton}>
							<MaterialIcons name={isSpeaking ? "volume-off" : "volume-up"} size={20} color={isDarkMode ? "#fff" : "black"} />
						</TouchableOpacity>
						<TouchableOpacity onPress={showSummary} style={styles.iconButton}>
							<MaterialIcons name="summarize" size={20} color={isDarkMode ? "#fff" : "black"} />
						</TouchableOpacity>
					</View>
				</View>

				{newsData.formattedContent.map((item, index) => (
					<View key={index} style={item.type === "quote" ? (isDarkMode ? darkStyles.quoteContainer : styles.quoteContainer) : null}>
						<EmbedContents text={item.text} isDarkMode={isDarkMode} styles={styles} darkStyles={darkStyles} />
					</View>
				))}
			</ScrollView>

			<SummaryModal
				visible={visible}
				onDismiss={hideModal}
				summaryText={summaryText}
				currentSummary={currentSummary}
				onNextSummary={nextSummary}
			/>
		</Provider>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "white"
	},
	scrollView: {
		backgroundColor: "white"
	},
	title: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 10
	},
	metaContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15
	},
	subtitle: {
		fontSize: 16,
		color: "#888"
	},
	iconContainer: {
		flexDirection: "row"
	},
	iconButton: {
		marginHorizontal: 8
	},
	body: {
		fontSize: 20,
		lineHeight: 28,
		color: "#444",
		marginBottom: 10
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	errorText: {
		color: "red",
		fontSize: 16
	},
	quoteContainer: {
		paddingLeft: 16,
		borderLeftWidth: 4,
		borderLeftColor: "#ccc",
		marginBottom: 10,
		backgroundColor: "#f7f7f7",
		paddingTop: 12,
		paddingBottom: 12
	},
	quote: {
		fontSize: 18,
		lineHeight: 26,
		color: "#444",
		fontStyle: "italic"
	},
	videoContainer: {
		marginVertical: 10,
		height: 200,
		overflow: "hidden",
		borderRadius: 10
	},
	video: {
		flex: 1
	},
	link: {
		color: "#1e90ff",
		textDecorationLine: "underline",
		marginBottom: 10
	}
});

const darkStyles = StyleSheet.create({
	...styles,
	container: {
		...styles.container,
		backgroundColor: "#1E1E1E"
	},
	scrollView: {
		...styles.scrollView,
		backgroundColor: "#1E1E1E"
	},
	title: {
		...styles.title,
		color: "#fff"
	},
	subtitle: {
		...styles.subtitle,
		color: "#ccc"
	},
	body: {
		...styles.body,
		color: "#ddd"
	},
	quoteContainer: {
		...styles.quoteContainer,
		borderLeftColor: "#555",
		backgroundColor: "#2a2a2a"
	},
	quote: {
		...styles.quote,
		color: "#ddd"
	},
	link: {
		color: "#87cefa",
		textDecorationLine: "underline",
		marginBottom: 10
	}
});

export default NewsDetail;

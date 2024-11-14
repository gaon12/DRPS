import React, { useContext, useState } from "react";
import { ScrollView, SafeAreaView, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { SettingsContext } from "../../../../../Context";
import patchNotes from "./data/patch_notes.json";
import defaultImage from "./imgs/default-patchnotes.png"; // Static default image

const PatchNotes = () => {
	const { settings } = useContext(SettingsContext); // Access context values
	const navigation = useNavigation(); // For navigating between screens
	const [imageLoadError, setImageLoadError] = useState({}); // To track image load failures

	// Local image mappings
	const localImageMapping = {
		"ios-patch.png": require("./imgs/default-patchnotes.png"), // Example image
		"android-patch.png": require("./imgs/default-patchnotes.png"),
	};

	// Get image URI or default based on availability
	const getImageUri = (patch) => {
		const { imageUri } = patch;
		if (imageLoadError[patch.id]) return defaultImage; // If error occurred, return default
		if (!imageUri) return defaultImage; // No image URI
		if (localImageMapping[imageUri]) return localImageMapping[imageUri]; // Mapped local image
		if (imageUri.startsWith("http")) return { uri: imageUri }; // Remote image
		return defaultImage; // Fallback to default
	};

	// Format version text based on language
	const formatVersionText = (version) => {
		return settings.language === "ko" ? `${version} 업데이트 안내` : `${version} Update Info`;
	};

	// Handle image loading error
	const handleImageError = (patchId) => {
		setImageLoadError((prev) => ({ ...prev, [patchId]: true }));
	};

	// Handle card click
	const handleVersionClick = (version) => {
		navigation.navigate("VersionDetails", { version });
	};

	return (
		<SafeAreaView style={[styles.container, settings.isDarkMode && styles.darkContainer]}>
			<ScrollView contentContainerStyle={{ padding: 10 }}>
				{patchNotes.map((patch) => (
					<TouchableOpacity key={patch.id} onPress={() => handleVersionClick(patch.version)}>
						<Card style={styles.card}>
							{/* Top Image Section */}
							<Image
								source={getImageUri(patch)}
								resizeMode="cover"
								style={styles.image}
								onError={() => handleImageError(patch.id)}
							/>
							{/* Version and Date Section */}
							<Card.Content>
								<Title style={[styles.title, settings.isDarkMode && styles.darkText]}>
									{formatVersionText(patch.version)}
								</Title>
								<Paragraph style={settings.isDarkMode ? styles.darkText : styles.lightText}>
									{patch.date}
								</Paragraph>
							</Card.Content>
						</Card>
					</TouchableOpacity>
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9f9f9",
		paddingTop: 10,
	},
	darkContainer: {
		backgroundColor: "#1E1E1E",
	},
	card: {
		marginBottom: 20,
	},
	image: {
		height: 200,
		width: "100%",
	},
	title: {
		marginTop: 10,
	},
	darkText: {
		color: "#FFFFFF",
	},
	lightText: {
		color: "#000000",
	},
});

export default PatchNotes;

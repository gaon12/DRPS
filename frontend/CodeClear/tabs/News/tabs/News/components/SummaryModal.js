// ./components/SummaryModal.js
import React, { useContext } from "react";
import { Modal, Portal, Button, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { SettingsContext } from "../../../../../Context"; // Adjusted path

const SummaryModal = ({ visible, onDismiss, summaryText, currentSummary, onNextSummary }) => {
	const { settings } = useContext(SettingsContext);
	const isDarkMode = settings.isDarkMode;
	const currentStyles = isDarkMode ? darkStyles : lightStyles;

	return (
		<Portal>
			<Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={currentStyles.modalContainer}>
				<Text style={currentStyles.modalTitle}>요약</Text>
				<Text style={currentStyles.modalText}>{summaryText[currentSummary]}</Text>

				{summaryText.length > 1 && summaryText[0] !== summaryText[1] && (
					<Button mode="outlined" onPress={onNextSummary} style={currentStyles.nextButton} labelStyle={currentStyles.nextButtonText}>
						다른 요약 보기
					</Button>
				)}

				<Text style={currentStyles.disclaimer}>
					자동 요약 기술로 요약된 기능입니다. 요약 기술의 특성상 중요 내용이 생략 될 수 있으므로 기사 전체를 읽는 것을 권장합니다.
				</Text>

				<Button mode="contained" onPress={onDismiss} style={currentStyles.closeButton}>
					닫기
				</Button>
			</Modal>
		</Portal>
	);
};

// PropTypes definition
SummaryModal.propTypes = {
	visible: PropTypes.bool.isRequired,
	onDismiss: PropTypes.func.isRequired,
	summaryText: PropTypes.arrayOf(PropTypes.string).isRequired,
	currentSummary: PropTypes.number.isRequired,
	onNextSummary: PropTypes.func.isRequired
};

// Base styles to reduce redundancy
const baseStyles = {
	modalContainer: {
		padding: 20,
		margin: 20,
		borderRadius: 10,
		alignItems: "center"
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center"
	},
	modalText: {
		fontSize: 17,
		marginBottom: 15,
		textAlign: "justify",
		lineHeight: 26 // Increased line spacing
	},
	nextButton: {
		marginTop: 15,
		marginBottom: 15
	},
	closeButton: {
		marginTop: 10,
		width: "100%"
	},
	disclaimer: {
		fontSize: 13,
		marginTop: 15,
		textAlign: "center",
		lineHeight: 20 // Increased line spacing
	}
};

// Light mode styles
const lightStyles = StyleSheet.create({
	...baseStyles,
	modalContainer: {
		...baseStyles.modalContainer,
		backgroundColor: "white"
	},
	modalTitle: {
		...baseStyles.modalTitle,
		color: "#333"
	},
	modalText: {
		...baseStyles.modalText,
		color: "#333"
	},
	nextButtonText: {
		color: "#333"
	},
	disclaimer: {
		...baseStyles.disclaimer,
		color: "#555"
	}
});

// Dark mode styles
const darkStyles = StyleSheet.create({
	...baseStyles,
	modalContainer: {
		...baseStyles.modalContainer,
		backgroundColor: "#333"
	},
	modalTitle: {
		...baseStyles.modalTitle,
		color: "#fff"
	},
	modalText: {
		...baseStyles.modalText,
		color: "#ddd"
	},
	nextButtonText: {
		color: "#ddd"
	},
	disclaimer: {
		...baseStyles.disclaimer,
		color: "#aaa"
	},
	closeButton: {
		...baseStyles.closeButton,
		backgroundColor: "#555"
	}
});

export default SummaryModal;

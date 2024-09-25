// ./hooks/handleTTS.js
import * as Speech from "expo-speech";

export const handleTTS = (isSpeaking, setIsSpeaking, newsData, settingsLang) => {
	if (isSpeaking) {
		Speech.stop();
		setIsSpeaking(false);
	} else {
		const content = newsData.formattedContent.map((item) => item.text).join("\n");
		Speech.speak(content, { language: settingsLang });
		setIsSpeaking(true);
	}
};

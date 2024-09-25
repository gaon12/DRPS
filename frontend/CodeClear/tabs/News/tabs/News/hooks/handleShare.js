// ./hooks/handleShare.js
import { Share } from "react-native";

export const handleShare = async (newsData) => {
	if (newsData) {
		try {
			await Share.share({
				message: `${newsData.yna_ttl}\n\n${newsData.formattedContent.map((item) => item.text).join("\n")}`,
			});
		} catch {
			console.log("Sharing failed");
		}
	}
};

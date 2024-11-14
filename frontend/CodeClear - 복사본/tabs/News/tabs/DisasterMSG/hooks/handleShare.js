// ./hooks/handleShare.js
import { Share } from "react-native";

export const handleShare = async (newsData = {}) => {
    try {
        const { yna_ttl = "제목 없음", formattedContent = [] } = newsData;

        if (formattedContent.length === 0) {
            console.warn("공유할 내용이 없습니다.");
            return;
        }

        const message = `${yna_ttl}\n\n${formattedContent.map(item => item.text).join("\n")}`;

        await Share.share({ message });
    } catch (error) {
        console.error("공유 실패:", error);
    }
};

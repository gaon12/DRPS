//translateContent.js
import axios from "axios";

// 원본 데이터를 받아와 번역된 데이터를 반환하는 함수
export const translateContent = async (data, lang) => {
    try {
        // team_nm을 번역할 텍스트에 포함
        const textToTranslate = `${data.yna_ttl}\n${data.team_nm}\n${data.formattedContent.map(item => item.text).join("\n")}`;

        const response = await axios.post("https://apis.uiharu.dev/trans/api2.php", {
            transSentence: textToTranslate,
            originLang: "ko",
            targetLang: lang
        });

        if (response.data.StatusCode === 200) {
            const translatedLines = response.data.translatedText.split("\n");
            // 첫 번째 줄은 제목, 두 번째 줄은 팀명
            const [translatedTitle, translatedTeamName, ...translatedContent] = translatedLines;

            data.yna_ttl = translatedTitle;
            data.team_nm = translatedTeamName;
            data.formattedContent = translateFormattedContent(translatedContent, data.formattedContent);
        }
    } catch (error) {
        console.error("Translation failed:", error);
    }
    return data;
};

// 번역된 텍스트를 원본의 형식에 맞게 매핑하는 함수
const translateFormattedContent = (translatedContent, originalFormattedContent) => {
    let translatedIndex = 0;
    return originalFormattedContent.map(item => {
        const lines = item.text.split("\n");
        const translatedLines = lines.map(() => translatedContent[translatedIndex++]);
        return {
            ...item,
            text: translatedLines.join("\n")
        };
    });
};

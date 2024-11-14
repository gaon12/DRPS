import axios from "axios";

export const handleSummaryGemini = async (newsData) => {
	try {
		// Extract content excluding quotes with only links
		const content = newsData.formattedContent
			.filter((item) => {
				// Exclude quote items containing only links
				const linkOnlyPattern = /^\[http?:\/\/[^\]]+\]$/;
				return !(item.type === "quote" && linkOnlyPattern.test(item.text));
			})
			.map((item) => {
				// Remove links inside text
				return item.text.replace(/\[http?:\/\/[^\]]+\]/g, "").trim();
			})
			.filter((text) => text !== "") // Remove empty texts
			.join("\n");

		// Send summarization request
		const response = await axios.post("https://apis.uiharu.dev/drps/summary/api.php", {
			text: content,
		});

		// summary 키 값이 있는지 확인하고 반환
		const summary = response.data.data?.summary;
		if (summary) {
			return summary;
		} else {
			throw new Error("요약 결과를 찾을 수 없습니다.");
		}
	} catch (error) {
		// Handle specific error when content is too short
		if (error.response && error.response.status === 400) {
			return ["요약이 없습니다."];
		}
		// Generic error handling with user-friendly message
		return ["요약에 실패했습니다. 다시 시도해주세요."];
	}
};

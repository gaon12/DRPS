import axios from "axios";

export const handleSummary = async (newsData) => {
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
		const response = await axios.post("https://apis.uiharu.dev/summarize", {
			text: content,
		});

		if (response.data.StatusCode === 200) {
			const { result, result2 } = response.data.data;
			return [result, result2];
		} else {
			throw new Error("Failed to summarize the content.");
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

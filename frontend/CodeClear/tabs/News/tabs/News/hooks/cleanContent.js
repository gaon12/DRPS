// hooks/cleanContent.js
export const cleanContent = data => {
	const { yna_cn, yna_ttl } = data;
	let lines = yna_cn
		.split("\n")
		.map(line => line.trim())
		.filter(line => line); // 불필요한 빈 줄 제거

	// 1. 뉴스 제목과 동일한 첫 번째 줄 제거
	if (lines[0] === yna_ttl.trim()) {
		lines.shift(); // 첫 줄 제거
	}

	let formattedContent = [];
	let currentBlock = [];
	let foundQuoteEnd = false;

	lines.forEach(line => {
		// 2. 인용문의 시작과 종료를 찾음
		const quotePattern = /\((.*?)=\s*연합뉴스\)\s*(.*\s*(기자|특파원)\s*=\s*)?/;
		if (quotePattern.test(line) && !foundQuoteEnd) {
			// 인용문이 끝나는 부분 바로 위까지가 인용문 블록으로 취급
			if (currentBlock.length > 0) {
				let quoteText = currentBlock.join("\n").replace(/\n$/, "");

				// 인용문 내 http 또는 https 대괄호 안 링크를 추출하여 저장하고, 인용문에서 제거
				const linkPattern = /\[http:\/\/[^\]]+\]|\[https:\/\/[^\]]+\]/g;
				const links = quoteText.match(linkPattern);
				if (links) {
					quoteText = quoteText.replace(linkPattern, "").trim(); // 인용문에서 링크 제거
				}

				if (quoteText) {
					formattedContent.push({
						type: "quote",
						text: quoteText
					});
				}

				// 인용문 뒤에 링크를 추가
				if (links) {
					links.forEach(link => {
						formattedContent.push({
							type: "normal",
							text: link
						});
					});
				}

				currentBlock = [];
			}

			// `(지역명=연합뉴스)`, `(지역명=연합뉴스) 기자명 기자 =`, `(지역명=연합뉴스) 기자명 특파원 =` 형식 제거
			line = line.replace(quotePattern, "").trim();
			if (line) {
				formattedContent.push({
					type: "normal",
					text: line
				});
			}

			foundQuoteEnd = true; // 인용문 범위 종료
			return; // 다음 줄로 이동
		}

		if (!foundQuoteEnd) {
			// 인용문에 해당하는 줄을 쌓음
			currentBlock.push(line);
		} else {
			// 일반 텍스트 처리
			formattedContent.push({
				type: "normal",
				text: line
			});
		}
	});

	// 인용문이 발견되지 않은 경우도 고려하여 처리
	if (currentBlock.length > 0 && !foundQuoteEnd) {
		const quoteText = currentBlock.join("\n").replace(/\n$/, "");
		if (quoteText) {
			formattedContent.push({
				type: "normal",
				text: quoteText
			});
		}
	}

	// 4. 맨 끝에 있는 이메일 주소와 '(끝)' 제거, 중복된 줄바꿈 제거
	formattedContent = formattedContent
		.map((item, index) => {
			if (item.type === "normal") {
				item.text = item.text
					.replace(/(.*@.*\..*)|\(끝\)/g, "") // 이메일 및 (끝) 제거
					.replace(/^\s*$/g, "") // 빈 줄 제거
					.trim();
				// 줄바꿈 처리
				if (index === formattedContent.length - 1) {
					item.text = item.text.replace(/\n+$/, "\n");
				} else {
					item.text = item.text.replace(/\n+/g, "\n");
				}
			}
			return item;
		})
		.filter(item => item.text); // 빈 텍스트 제거

	// 5. 콘텐츠가 비어 있거나 의미 없는 경우 처리
	if (
		formattedContent.length === 0 ||
		(formattedContent.length === 1 &&
			formattedContent[0].type === "quote" &&
			(!formattedContent[0].text.trim() || formattedContent[0].text.trim() === "(끝)"))
	) {
		formattedContent = [
			{
				type: "normal",
				text: "기사 내용이 없습니다. 속보 기사이거나 일부 기사에는 기사 내용이 없을 수 있습니다."
			}
		];
	}

	return { ...data, formattedContent };
};

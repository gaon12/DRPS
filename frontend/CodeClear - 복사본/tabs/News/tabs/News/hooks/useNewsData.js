import { useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { cleanContent } from "./cleanContent";
import { translateContent } from "./translateContent"; // 분리된 함수 가져오기

const useNewsData = yna_no => {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [settingsLang, setSettingsLang] = useState("ko");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lang = (await SecureStore.getItemAsync("Settings_Language")) || "ko";
                setSettingsLang(lang);

                const response = await axios.get(`https://apis.uiharu.dev/drps/news/api.php`, {
                    params: { yna_no }
                });
                if (response.data.StatusCode === 200) {
                    let cleanedData = cleanContent(response.data.data[0]);
                    if (lang !== "ko") {
                        cleanedData = await translateContent(cleanedData, lang);
                    }
                    setNewsData(cleanedData);
                } else {
                    throw new Error("Failed to fetch news data");
                }
            } catch {
                setError("뉴스 데이터를 가져오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [yna_no]);

    return { newsData, loading, error, settingsLang };
};

export default useNewsData;

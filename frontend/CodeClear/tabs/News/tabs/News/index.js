import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { SettingsContext } from "../../../../Context";
import { Button } from "react-native-paper";

const NewsList = ({ navigation }) => {
  const [newsData, setNewsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { settings } = useContext(SettingsContext);
  const isDarkMode = settings.isDarkMode;

  // 텍스트 클리닝 기능
  const cleanContent = (data) => {
    const cleanedContent = data.yna_cn
      .split("\n")
      .filter(
        (line, index) =>
          !(index === 0 && line.trim() === data.yna_ttl.trim()) &&
          !/^[^\s]+\s*=\s*연합뉴스/.test(line) &&
          !/\s*기자\s*=\s*/.test(line) &&
          !line.includes("(끝)") &&
          !line.includes("@")
      )
      .map((line) => line.replace(/\s{2,}/g, " ").trim())
      .filter((line) => line !== "")
      .join(" ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");

    return { ...data, yna_cn: cleanedContent };
  };

  // 뉴스 데이터 가져오기
  const fetchNewsData = async (pageNo, isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const response = await axios.get(
        `https://apis.uiharu.dev/drps/news/api.php?pageNo=${pageNo}`
      );
      if (response.data.StatusCode === 200) {
        const cleanedData = response.data.data.map(cleanContent);
        setNewsData((prevNews) =>
          isRefresh ? cleanedData : [...prevNews, ...cleanedData]
        );
      } else {
        setNewsData([]);
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
      setNewsData([]);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData(pageNo);
  }, [pageNo]);

  const loadMoreNews = () => {
    if (!loading && !refreshing) {
      setPageNo((prevPageNo) => prevPageNo + 1);
    }
  };

  const onRefresh = () => {
    setPageNo(1);
    fetchNewsData(1, true);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("NewsDetail", { yna_no: item.yna_no })}
      style={styles.articleContainer}
    >
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        {item.yna_ttl.length > 30
          ? `${item.yna_ttl.slice(0, 30)}...`
          : item.yna_ttl}
      </Text>
      <View style={styles.dateContainer}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={14}
          color={isDarkMode ? "#aaa" : "#666"}
        />
        <Text style={[styles.date, isDarkMode && styles.dateDark]}>
          {item.crt_dt}
        </Text>
      </View>
      <Text style={[styles.excerpt, isDarkMode && styles.excerptDark]}>
        {item.yna_cn.length > 80
          ? `${item.yna_cn.slice(0, 80)}...`
          : item.yna_cn}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="text"
          onPress={() => navigation.navigate("NewsDetail", { yna_no: item.yna_no })}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonText, isDarkMode && styles.buttonTextDark]}
        >
          자세히 보기
        </Button>
        <MaterialIcons
          name="arrow-forward"
          size={16}
          style={[styles.icon, isDarkMode && styles.iconDark]}
        />
      </View>
      {index < newsData.length - 1 && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <FlatList
        data={newsData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.yna_no}-${index}`}
        onEndReached={loadMoreNews}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#000"} />
            </View>
          )
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fcfafb",
  },
  containerDark: {
    backgroundColor: "#1E1E1E",
  },
  articleContainer: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  titleDark: {
    color: "#fff",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  dateDark: {
    color: "#ccc",
  },
  excerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  excerptDark: {
    color: "#ccc",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
    color: "#000",
  },
  buttonTextDark: {
    color: "#fff",
  },
  icon: {
    marginTop: 1,
  },
  iconDark: {
    color: "#ccc",
  },
  separator: {
    marginTop: 16,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  loadingContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NewsList;

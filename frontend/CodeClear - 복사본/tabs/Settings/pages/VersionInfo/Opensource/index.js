import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Text, Title } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import list from './list.json'; // list.json 파일 읽기

const LicenseList = () => {
	const renderLicenses = () => {
		return Object.keys(list).map((licenseType) => (
			<Card key={licenseType} style={styles.card}>
				<Card.Title title={licenseType} titleStyle={styles.licenseTitle} />
				<Card.Content>
					{list[licenseType].map((item, index) => (
						<Text
							key={`${licenseType}-${index}`}
							style={styles.licenseItem}
							onPress={() => Linking.openURL(item.url)}
						>
							{item.name}
						</Text>
					))}
				</Card.Content>
			</Card>
		));
	};

	return (
		<ScrollView style={styles.container}>
			{renderLicenses()}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5',
	},
	card: {
		marginBottom: 16,
		borderRadius: 8,
	},
	licenseTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	licenseItem: {
		fontSize: 16,
		marginVertical: 8,
		color: '#0066cc',
		textDecorationLine: 'underline',
	},
});

export default LicenseList;

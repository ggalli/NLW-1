import React, { useState, useEffect } from "react";
import { View, ImageBackground, Image, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface UFs {
	sigla: string;
}

interface Cities {
	nome: string;
}

const Home = () => {
	const [UFs, setUFs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');

	const [searchTermCity, setSearchTermCity] = useState('');

	const navigation = useNavigation();

	useEffect(() => {
		axios.get<UFs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUFs(ufInitials);
		})
	}, []);

	useEffect(() => {
		if (selectedUf === '0') return;

		axios.get<Cities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cities = response.data.map(city => city.nome);
			setCities(cities);
		})
	}, [selectedUf]);

	function navigateToPoints() {
		navigation.navigate('Points', {
			uf: selectedUf,
			city: selectedCity
		});
	}

	return (
		<KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ImageBackground 
				source={require('../../assets/home-background.png')} 
				style={styles.container}
				imageStyle={{ width: 274, height: 368 }}
			>
				<View style={styles.main}>
					<Image source={require('../../assets/logo.png')} />
					<Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
					<Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
				</View>

				<View style={styles.footer}>

					<View style={styles.input}>
						<Picker
							selectedValue={selectedUf}
							onValueChange={(itemValue:any, itemIndex) => setSelectedUf(itemValue)}>
							<Picker.Item label="Selecione um estado" value="0" />
							{UFs.map(uf => (
								<Picker.Item key={uf} label={uf} value={uf} />
							))}
						</Picker>
					</View>

					<View style={styles.input}>
						<Picker
							selectedValue={selectedCity}
							onValueChange={(itemValue:any, itemIndex) => setSelectedCity(itemValue)}>
							<Picker.Item label="Selecione uma cidade" value="0" />
							{cities.map(city => (
								<Picker.Item key={city} label={city} value={city} />
							))}
						</Picker>
					</View>
					{/* <TextInput 
						style={styles.input}
						placeholder="Digite o estado"
						value={uf}
						maxLength={2}
						autoCapitalize="characters"
						autoCorrect={false}
						onChangeText={setUf}
					/>
					<TextInput 
						style={styles.input}
						placeholder="Digite a cidade"
						value={city}
						autoCorrect={false}
						onChangeText={setCity}
					/> */}
					
					<RectButton style={styles.button} onPress={navigateToPoints}>
						<View style={styles.buttonIcon}>
							<Text>
								<Icon name="arrow-right" color="#fff" size={24}	/>
							</Text>
						</View>
						<Text style={styles.buttonText}>
							Entrar
						</Text>
					</RectButton>
				</View>

			</ImageBackground>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
	},

	main: {
		flex: 1,
		justifyContent: "center",
	},

	title: {
		color: "#322153",
		fontSize: 32,
		fontFamily: "Ubuntu_700Bold",
		maxWidth: 260,
		marginTop: 64,
	},

	description: {
		color: "#6C6C80",
		fontSize: 16,
		marginTop: 16,
		fontFamily: "Roboto_400Regular",
		maxWidth: 260,
		lineHeight: 24,
	},

	footer: {},

	select: {},

	input: {
		backgroundColor: "#FFF",
		borderRadius: 10,
		marginBottom: 8,
		paddingLeft: 16,
		fontSize: 16,
	},

	button: {
		backgroundColor: "#34CB79",
		height: 60,
		flexDirection: "row",
		borderRadius: 10,
		overflow: "hidden",
		alignItems: "center",
		marginTop: 8,
	},

	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
		justifyContent: "center",
		alignItems: "center",
	},

	buttonText: {
		flex: 1,
		justifyContent: "center",
		textAlign: "center",
		color: "#FFF",
		fontFamily: "Roboto_500Medium",
		fontSize: 16,
	},
});

export default Home;
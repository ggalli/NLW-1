import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';

import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';

import Routes from './src/routes';

export default function App() {
	const [fontsLoaded] = useFonts({
		Roboto_400Regular, 
		Roboto_500Medium,
		Ubuntu_700Bold
	})

	if (!fontsLoaded) {
		return <AppLoading />
	}

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <Routes />
    </>
  );
}



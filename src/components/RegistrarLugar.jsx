import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RegistrarLugar({ route }) {
  // Obtener las coordenadas pasadas desde la pantalla Mapa
  const { location } = route.params || {}; // Usar un valor por defecto si no se pasan coordenadas

  return (
    <View style={styles.container}>
      {location ? (
        <Text style={styles.text}>
          Coordenadas seleccionadas para registrar el marcador:
          {'\n'}
          Latitud: {location.latitude}
          {'\n'}
          Longitud: {location.longitude}
        </Text>
      ) : (
        <Text style={styles.text}>No se seleccionó ninguna ubicación.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from '../utils/firebase'; // Ajusta la ruta según tu configuración

const db = getFirestore(app);

export default function Mapa({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [places, setPlaces] = useState([]); // Lugares registrados

  // Obtener la ubicación actual
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permisos de ubicación denegados');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Obtener los datos de Firestore
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lugares"));
        const lugares = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlaces(lugares);
      } catch (error) {
        console.error("Error al obtener lugares:", error);
      }
    };

    fetchPlaces();
  }, []);

  // Limpiar la selección al regresar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      setSelectedLocation();
    }, [])
  );

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    navigation.navigate('RegistrarLugar', { location: { latitude, longitude } });
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      customMapStyle={[
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }],
        },
      ]}
      onPress={handleMapPress}
    >
      {/* Marcador para la ubicación actual */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="Ubicación actual"
        description="Este es tu punto inicial"
      />
      {/* Marcador para la ubicación seleccionada */}
      {selectedLocation && (
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
          title="Ubicación seleccionada"
          description={`Latitud: ${selectedLocation.latitude}\nLongitud: ${selectedLocation.longitude}`}
        />
      )}
      {/* Marcadores para los lugares registrados en Firestore */}
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.coordenadas.latitud,
            longitude: place.coordenadas.longitud,
          }}
          title={place.nombre}
          description={place.descripcion}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

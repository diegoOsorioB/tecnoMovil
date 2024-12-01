import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

export default function Mapa({ navigation }) { // Recibe navigation como prop
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        (async () => {
            // Solicitar permisos de ubicación
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permisos de ubicación denegados');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
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
        navigation.navigate('RegistrarLugar', {location:{latitude,longitude}})
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
            <Marker
                coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                }}
                title="Ubicación actual"
                description="Este es tu punto inicial"
            />
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

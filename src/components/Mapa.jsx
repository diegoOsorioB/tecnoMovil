import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Mapa() {
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

            // Obtener la ubicación actual
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
    }, []);

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
    };

    return (
        <View style={styles.container}>
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

            <View style={styles.menu}>
                <TouchableOpacity style={styles.boton}>
                    <Text>Registrar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.boton}>
                    <Text>Boton</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.boton}>
                    <Text>Boton</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems:'center',
        bottom: 20, // Ajusta según tu preferencia
        left: 20,
        right: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        elevation: 5, // Sombra para darle un efecto de profundidad
    },
    boton:{
        backgroundColor:'#000'
    }
});

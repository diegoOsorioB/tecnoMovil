import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from '../utils/firebase'; // Ajusta la ruta según tu configuración
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect

const db = getFirestore(app);

export default function Mapa({ navigation }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [mapRegion, setMapRegion] = useState(null); // Región actual de la cámara
    const [places, setPlaces] = useState([]); // Lugares registrados

    // Obtener la ubicación actual
    useEffect(() => {
        let locationSubscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();// Solicita los permisos de ubicacion
            if (status !== 'granted') {
                setErrorMsg('Permisos de ubicación denegados');
                return;
            }

            let initialLocation = await Location.getCurrentPositionAsync({}); //Ubicacion actual del usuario
            setLocation(initialLocation.coords);//Guarda coordenas

            // Configuración inicial de la región del mapa
            setMapRegion({
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude,
                latitudeDelta: 0.01, //ZOOM para el mapa
                longitudeDelta: 0.01,
            });

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High, //Configura la precision en alta
                    timeInterval: 1000, //Se actuliza cada segundo
                    distanceInterval: 0,
                },
                (newLocation) => {
                    setLocation(newLocation.coords); //Actualizacion de las coorednadas
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove(); //Limpia la suscripcion al salir del componente
            }
        };
    }, []);

    // Función para obtener los lugares de Firestore
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

    
//Indicador de carga
    if (!location || !mapRegion) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
        );
    }

    const handleMapPress = () => {
        navigation.navigate('RegistrarLugar', { location: mapRegion });
    };

    return (
        <>
            <TouchableOpacity style={styles.boton} onPress={handleMapPress}>
                <Text style={styles.botonTexto}>Registrar Lugar</Text>
            </TouchableOpacity>
            <MapView
                style={styles.map}
                initialRegion={mapRegion}
                onRegionChange={(region) => setMapRegion(region)} // Actualizar dinámicamente la región mientras la cámara se mueve
                onRegionChangeComplete={(region) => setMapRegion(region)} // Finalizar la región cuando la cámara se detenga
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
            >
                {/* Marcador dinámico que sigue la posición de la cámara */}
                {mapRegion && (
                    <Marker
                        coordinate={{
                            latitude: mapRegion.latitude,
                            longitude: mapRegion.longitude,
                        }}
                        title="Posición a seleccionar"
                        description={`Latitud: ${mapRegion.latitude}, Longitud: ${mapRegion.longitude}`}
                        pinColor="blue"
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
        </>
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
        backgroundColor: '#f1f1f1',
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
        marginTop: 10,
    },
    boton: {
        position: 'absolute', // Botón flotante sobre el mapa
        bottom: '90%',           // Ubicado a 30 unidades desde el fondo
        left: '50%',          // Centrado horizontalmente
        marginLeft: -100,     // Ajuste para centrar el botón
        backgroundColor: '#3cb371', // Color verde suave
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botonTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

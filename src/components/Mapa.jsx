import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from '../utils/firebase'; 
import { useFocusEffect } from '@react-navigation/native';

const db = getFirestore(app);

export default function Mapa({ navigation }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [mapRegion, setMapRegion] = useState(null); 
    const [places, setPlaces] = useState([]); 

   
    useEffect(() => {
        let locationSubscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permisos de ubicación denegados');
                return;
            }

            let initialLocation = await Location.getCurrentPositionAsync({});
            setLocation(initialLocation.coords);

            
            setMapRegion({
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 0,
                },
                (newLocation) => {
                    setLocation(newLocation.coords);
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    
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

    
    useFocusEffect(
        React.useCallback(() => {
            fetchPlaces(); 
        }, [])
    );

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
                onRegionChange={(region) => setMapRegion(region)} 
                onRegionChangeComplete={(region) => setMapRegion(region)} 
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
        position: 'absolute', 
        bottom: '90%',           
        left: '50%',         
        marginLeft: -100,
        backgroundColor: '#3cb371',
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

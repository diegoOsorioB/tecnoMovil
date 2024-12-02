import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Modal, Button, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from '../utils/firebase';
import * as Location from 'expo-location';

const db = getFirestore(app);

export default function MapaUsuario({ navigation }) {
    const [places, setPlaces] = useState([]);
    const [location, setLocation] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    const fetchUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert("Permisos de ubicación denegados");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
    };

    useEffect(() => {
        fetchPlaces();
        fetchUserLocation();
    }, []);

    const handleMarkerPress = (place) => {
        setSelectedPlace(place);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedPlace(null);
    };

    if (!location || places.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Cargando mapa...</Text>
            </View>
        );
    }

   

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
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
            >
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.coordenadas.latitud,
                            longitude: place.coordenadas.longitud,
                        }}
                        title={place.nombre}
                        description={place.descripcion}
                        onPress={() => handleMarkerPress(place)}
                    />
                ))}
            </MapView>

            {selectedPlace && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedPlace.imagen && (
                                <Image
                                    source={{ uri: selectedPlace.imagen }}
                                    style={styles.modalImage}
                                    resizeMode="cover"
                                />
                            )}
                            <Text style={styles.modalTitle}>{selectedPlace.nombre}</Text>
                            <Text style={styles.modalDescription}>{selectedPlace.descripcion}</Text>
                            <Text style={styles.modalDescription}>{selectedPlace.horarios}</Text>
                            <Button title="Cerrar" onPress={closeModal} />
                            <Button
                                title="Reseñas"
                                onPress={() => {
                                    closeModal();
                                    navigation.navigate('Reseñas', { placeId: selectedPlace.id });
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: 'center',
    },
    modalImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalDescription: {
        fontSize: 16,
        marginVertical: 10,
    },
});

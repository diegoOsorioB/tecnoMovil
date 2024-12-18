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
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando mapa...</Text>
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
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Cerrar"
                                    onPress={closeModal}
                                    color="#3b82f6"
                                    style={styles.button}
                                />
                                <Button
                                    title="Reseñas"
                                    onPress={() => {
                                        closeModal();
                                        navigation.navigate('Reseñas', { placeId: selectedPlace.id });
                                    }}
                                    color="#ec4899"
                                    style={styles.button}
                                />
                            </View>
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
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo más oscuro para el modal
    },
    modalContent: {
        backgroundColor: '#ffffff', // Fondo blanco para el contenido del modal
        padding: 20,
        borderRadius: 15, // Borde redondeado
        width: '85%', // Se ajusta para pantallas más grandes
        maxWidth: 350, // Limita el tamaño máximo
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5, // Sombra sutil para darle profundidad
    },
    modalImage: {
        width: '100%',
        height: 180,
        borderRadius: 15,
        marginBottom: 15, // Espaciado para la imagen
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333', // Texto oscuro para el título
        marginBottom: 10, // Separación del título
    },
    modalDescription: {
        fontSize: 16,
        color: '#555', // Texto gris claro para la descripción
        marginVertical: 8, // Separación entre párrafos
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        marginVertical: 8,
        borderRadius: 10,
        backgroundColor: '#3b82f6', // Color primario de la app
        marginHorizontal: 5,
    },
});

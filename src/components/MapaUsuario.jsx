import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Modal, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from '../utils/firebase'; // Ajusta la ruta según tu configuración
import * as Location from 'expo-location'; // Importamos expo-location para obtener la ubicación

const db = getFirestore(app);

export default function MapaUsuario() {
    const [places, setPlaces] = useState([]); // Lugares registrados
    const [location, setLocation] = useState(null); // Ubicación del usuario
    const [selectedPlace, setSelectedPlace] = useState(null); // Lugar seleccionado para mostrar en el modal
    const [modalVisible, setModalVisible] = useState(false); // Estado de visibilidad del modal

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

    // Función para obtener la ubicación actual del usuario
    const fetchUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert("Permisos de ubicación denegados");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords); // Establecer la ubicación del usuario
    };

    // Cargar lugares y ubicación al montar el componente
    useEffect(() => {
        fetchPlaces();
        fetchUserLocation(); // Obtener la ubicación del usuario
    }, []);

    const handleMarkerPress = (place) => {
        setSelectedPlace(place); // Establecer el lugar seleccionado
        setModalVisible(true); // Mostrar el modal
    };

    const closeModal = () => {
        setModalVisible(false); // Cerrar el modal
        setSelectedPlace(null); // Limpiar el lugar seleccionado
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
                    latitude: location.latitude, // Usamos la ubicación del usuario
                    longitude: location.longitude, // Usamos la ubicación del usuario
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
                        onPress={() => handleMarkerPress(place)} // Manejador de evento para cuando se presiona el marcador
                    />
                ))}
            </MapView>

            {/* Modal para mostrar los detalles del lugar seleccionado */}
            {selectedPlace && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedPlace.nombre}</Text>
                            <Text style={styles.modalDescription}>{selectedPlace.descripcion}</Text>
                            <Button title="Cerrar" onPress={closeModal} />
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: 'center',
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

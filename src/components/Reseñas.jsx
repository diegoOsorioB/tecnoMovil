import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView } from 'react-native';
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import app from '../utils/firebase'; // Ajusta la ruta según tu configuración

const db = getFirestore(app);

export default function Reseñas({ route, navigation }) {
    const [place, setPlace] = useState(null); // Lugar seleccionado
    const [comentarios, setComentarios] = useState([]); // Comentarios del lugar
    const [nuevoComentario, setNuevoComentario] = useState(''); // Comentario nuevo
    const { placeId } = route.params; // Recibimos el ID del lugar desde la navegación

    // Cargar los datos del lugar y los comentarios
    useEffect(() => {
        const fetchPlaceData = async () => {
            const placeRef = doc(db, 'lugares', placeId); // Referencia al lugar
            const docSnap = await getDoc(placeRef);
            if (docSnap.exists()) {
                setPlace(docSnap.data()); // Establecer los datos del lugar
            } else {
                console.log('No se encontró el lugar');
            }

            // Obtener los comentarios
            const comentariosRef = collection(placeRef, 'comentarios');
            const comentariosSnap = await getDocs(comentariosRef);
            const comentariosList = comentariosSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComentarios(comentariosList);
        };

        fetchPlaceData();
    }, [placeId]);

    const agregarComentario = async () => {
        if (nuevoComentario.trim() === '') return;

        const placeRef = doc(db, 'lugares', placeId);
        const nuevoComentarioData = {
            usuario: 'Usuario Prueba', // Nombre de usuario
            comentario: nuevoComentario,
            fecha: Timestamp.fromDate(new Date()), // Convertir Date a Timestamp de Firebase
        };

        // Agregar el comentario a Firebase
        const docRef = await addDoc(collection(placeRef, 'comentarios'), nuevoComentarioData);

        // Actualizar el estado local con el nuevo comentario
        setComentarios((prevComentarios) => [
            ...prevComentarios,
            {
                id: docRef.id,
                ...nuevoComentarioData,
            },
        ]);

        setNuevoComentario(''); // Limpiar el input
    };

    return (
        <View style={styles.container}>
            {place ? (
                <>
                    <Text style={styles.title}>{place.nombre}</Text>
                    <Text>{place.descripcion}</Text>
                    <Text>{place.horarios}</Text>

                    {/* Mostrar comentarios dentro de ScrollView */}
                    <ScrollView style={styles.scroll}>
                        {comentarios.length > 0 ? (
                            comentarios.map((comentario) => (
                                <View key={comentario.id} style={styles.comentario}>
                                    <Text style={styles.bold}>{comentario.usuario}</Text>
                                    <Text>{comentario.comentario}</Text>
                                    <Text>
                                        {new Date(comentario.fecha.seconds * 1000).toLocaleString()}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text>No hay comentarios aún.</Text>
                        )}
                    </ScrollView>

                    {/* Agregar nuevo comentario */}
                    <TextInput
                        style={styles.input}
                        placeholder="Deja tu comentario..."
                        value={nuevoComentario}
                        onChangeText={setNuevoComentario}
                    />
                    <Button title="Enviar comentario" onPress={agregarComentario} />
                </>
            ) : (
                <Text>Cargando datos del lugar...</Text>
            )}
            <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Cambiado para alinear el contenido hacia arriba
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scroll: {
        width: '100%',
        marginVertical: 20, // Separación del resto de elementos
        maxHeight: 300, // Altura máxima para limitar el área desplazable
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
    },
    comentario: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
    input: {
        borderWidth: 1,
        width: '100%',
        padding: 10,
        marginTop: 20,
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
});

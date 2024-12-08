import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import app from '../utils/firebase'; 

const db = getFirestore(app);
const auth = getAuth(); 

export default function Reseñas({ route, navigation }) {
    const [place, setPlace] = useState(null); 
    const [comentarios, setComentarios] = useState([]); 
    const [nuevoComentario, setNuevoComentario] = useState(''); 
    const { placeId } = route.params;


    
    useEffect(() => {
        const fetchPlaceData = async () => {
            const placeRef = doc(db, 'lugares', placeId); 
            const docSnap = await getDoc(placeRef);
            if (docSnap.exists()) {
                setPlace(docSnap.data()); 
            } else {
                console.log('No se encontró el lugar');
            }

            
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

        
        const user = auth.currentUser;
        const usuarioNombre = user ? user.displayName || 'Usuario Anónimo' : 'Usuario Anónimo';
        console.log(user)
        console.log(user.displayName)
        const placeRef = doc(db, 'lugares', placeId);
        const nuevoComentarioData = {
            usuario: usuarioNombre, 
            comentario: nuevoComentario,
            fecha: Timestamp.fromDate(new Date()), 
        };

        
        const docRef = await addDoc(collection(placeRef, 'comentarios'), nuevoComentarioData);

        
        setComentarios((prevComentarios) => [
            ...prevComentarios,
            {
                id: docRef.id,
                ...nuevoComentarioData,
            },
        ]);

        setNuevoComentario(''); 
    };

    return (
        <View style={styles.container}>
            {place ? (
                <>
                    <Text style={styles.title}>{place.nombre}</Text>
                    <Text style={styles.description}>{place.descripcion}</Text>
                    <Text style={styles.hours}>Horarios: {place.horarios}</Text>


                    <ScrollView style={styles.scroll}>
                        {comentarios.length > 0 ? (
                            comentarios.map((comentario) => (
                                <View key={comentario.id} style={styles.comentario}>
                                    <Text style={styles.bold}>{comentario.usuario}</Text>
                                    <Text>{comentario.comentario}</Text>
                                    <Text style={styles.date}>
                                        {new Date(comentario.fecha.seconds * 1000).toLocaleString()}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noComments}>No hay comentarios aún.</Text>
                        )}
                    </ScrollView>

                    
                    <TextInput
                        style={styles.input}
                        placeholder="Deja tu comentario..."
                        value={nuevoComentario}
                        onChangeText={setNuevoComentario}
                    />
                    <TouchableOpacity style={styles.button} onPress={agregarComentario}>
                        <Text style={styles.buttonText}>Enviar comentario</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.loading}>Cargando datos del lugar...</Text>
            )}
            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                <Text style={styles.goBackText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5', // Fondo claro
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333', // Texto principal oscuro
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#555', // Texto secundario
        marginBottom: 10,
    },
    hours: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333', // Texto principal
        marginBottom: 20,
    },
    scroll: {
        width: '100%',
        marginVertical: 20,
        maxHeight: 300,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd', // Bordes suaves
        padding: 10,
        backgroundColor: '#fff', // Fondo blanco
    },
    comentario: {
        marginBottom: 15,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd', // Bordes suaves
    },
    bold: {
        fontWeight: 'bold',
        color: '#333', // Texto oscuro para el nombre del usuario
    },
    date: {
        fontSize: 12,
        color: '#777', // Texto suave para la fecha
        marginTop: 5,
    },
    noComments: {
        fontSize: 16,
        color: '#888', // Texto suave para sin comentarios
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd', // Bordes suaves
        backgroundColor: '#fff', // Fondo blanco
        marginBottom: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: '#4CAF50', // Verde brillante para el botón
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff', // Texto blanco para contraste
        fontSize: 16,
        fontWeight: 'bold',
    },
    loading: {
        fontSize: 18,
        color: '#333', // Texto principal para cargando
        textAlign: 'center',
    },
    goBackButton: {
        padding: 10,
        backgroundColor: '#3b82f6', // Azul para botón de volver
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    goBackText: {
        color: '#fff', // Texto blanco para el botón de volver
        fontSize: 16,
    },
});

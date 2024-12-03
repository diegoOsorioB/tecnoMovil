import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import app from '../utils/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importa el ícono

const db = getFirestore(app);

export default function MostrarLugares({ navigation }) {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const uid = currentUser ? currentUser.uid : null;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const lugaresRef = collection(db, "lugares");
    const q = query(lugaresRef, where("uid_usuario", "==", uid));

    // Listener en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lugaresData = [];
      querySnapshot.forEach((doc) => {
        lugaresData.push({ id: doc.id, ...doc.data() }); // Incluye el ID del documento
      });

      setLugares(lugaresData);
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar cambios en lugares: ", error);
      setLoading(false);
    });

    // Limpieza del listener al desmontar el componente
    return () => unsubscribe();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Cargando lugares...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares registrados por el usuario:</Text>
      {lugares.length === 0 ? (
        <Text style={styles.noLugares}>No se han registrado lugares.</Text>
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.lugarItem}
              onPress={() => navigation.navigate("ModifcarLugar", { lugar: item })} // Navegar a la pantalla de modificación
            >
              <View style={styles.lugarInfo}>
                <Text style={styles.lugarTitle}>{item.nombre}</Text>
                <Text style={styles.lugarDetails}>{item.descripcion}</Text>
                <Text style={styles.lugarDetails}>{item.horarios}</Text>
                <Text style={styles.lugarLocation}>Ubicación: {item.coordenadas.latitud}, {item.coordenadas.longitud}</Text>
              </View>
              <Icon name="edit" size={30} color="#00796b" style={styles.editIcon} /> {/* Ícono de editar */}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4', // Fondo de la pantalla más suave
  },
  title: {
    fontSize: 22, // Tamaño de fuente un poco mayor para mayor legibilidad
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00796b', // Color verde más agradable
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    color: '#616161', // Color gris suave para los textos
  },
  lugarItem: {
    backgroundColor: '#ffffff', // Fondo blanco para las tarjetas
    padding: 15,
    marginBottom: 20, // Separación mayor entre los elementos
    borderRadius: 8,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    elevation: 4, // Sombra para un efecto de profundidad
    flexDirection: 'row', // Colocar el texto a la izquierda y el ícono a la derecha
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lugarInfo: {
    flex: 1,
  },
  lugarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b', // Título con un color destacado
  },
  lugarDetails: {
    fontSize: 14,
    color: '#424242', // Color gris para detalles
    marginTop: 5,
  },
  lugarLocation: {
    fontSize: 14,
    color: '#424242',
    marginTop: 5,
    fontStyle: 'italic', // Hacer la ubicación un poco diferente visualmente
  },
  noLugares: {
    fontSize: 18,
    color: '#757575', // Color suave para el mensaje de "sin lugares"
    fontStyle: 'italic', // Estilo de fuente diferente
    marginTop: 20,
  },
  editIcon: {
    marginLeft: 10,
  },
});

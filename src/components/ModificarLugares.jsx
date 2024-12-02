import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from '../utils/firebase'; // Ajusta la ruta si tu configuración está en otro lugar

const db = getFirestore(app);

export default function MostrarLugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener el UID del usuario actual
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const uid = currentUser ? currentUser.uid : null;

  useEffect(() => {
    const fetchLugares = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        // Consultar los lugares de Firestore donde userId es igual al uid del usuario actual
        const lugaresRef = collection(db, "lugares");
        const q = query(lugaresRef, where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        
        // Almacenar los resultados en el estado
        const lugaresData = [];
        querySnapshot.forEach((doc) => {
          lugaresData.push(doc.data());
        });

        setLugares(lugaresData);
      } catch (error) {
        console.error("Error al obtener lugares: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLugares();
  }, [uid]);

  // Mostrar un indicador de carga mientras se obtienen los datos
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
        <Text>No se han registrado lugares.</Text>
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.lugarItem}>
              <Text style={styles.lugarTitle}>{item.nombre}</Text>
              <Text>{item.descripcion}</Text>
              <Text>{item.horarios}</Text>
              <Text>Ubicación: {item.coordenadas.latitud}, {item.coordenadas.longitud}</Text>
            </View>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  lugarItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  lugarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

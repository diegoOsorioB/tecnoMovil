import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { getFirestore, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import app from '../utils/firebase';

const db = getFirestore(app);

export default function ModificarLugar({ route, navigation }) {
  const { lugar } = route.params;

  const [nombre, setNombre] = useState(lugar.nombre);
  const [descripcion, setDescripcion] = useState(lugar.descripcion);
  const [horarios, setHorarios] = useState(lugar.horarios);
  const [activo, setActivo] = useState(lugar.activo);

  const [modalVisible, setModalVisible] = useState(false); // Controlar la visibilidad del modal
  const [reseñas, setReseñas] = useState([]); // Almacenar las reseñas

  const handleUpdate = async () => {
    try {
      const lugarRef = doc(db, "lugares", lugar.id);
      await updateDoc(lugarRef, {
        nombre,
        descripcion,
        horarios,
        activo,
      });
      Alert.alert("Lugar actualizado con éxito");
      navigation.goBack(); // Volver a la pantalla anterior
    } catch (error) {
      console.error("Error al actualizar lugar: ", error);
      Alert.alert("Error al actualizar lugar");
    }
  };

  const cargarReseñas = async () => {
    try {
      const comentariosRef = collection(doc(db, "lugares", lugar.id), "comentarios");
      const comentariosSnap = await getDocs(comentariosRef);

      const comentariosList = comentariosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReseñas(comentariosList);
      setModalVisible(true); // Mostrar el modal después de cargar las reseñas
    } catch (error) {
      console.error("Error al cargar reseñas: ", error);
      Alert.alert("Error al cargar las reseñas");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Editar Lugar</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]} // Estilo personalizado para área de texto
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción"
          placeholderTextColor="#888"
          multiline
        />

        <Text style={styles.label}>Horarios</Text>
        <TextInput
          style={styles.input}
          value={horarios}
          onChangeText={setHorarios}
          placeholder="Horarios"
          placeholderTextColor="#888"
        />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Activo</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            thumbColor={activo ? "#00796b" : "#ccc"}
            trackColor={{ false: "#ddd", true: "#80cbc4" }}
          />
        </View>

        <Button title="Guardar Cambios" onPress={handleUpdate} color="#00796b" />

        {/* Botón para cargar reseñas */}
        <TouchableOpacity style={styles.loadReviewsButton} onPress={cargarReseñas}>
          <Text style={styles.loadReviewsText}>Ver Reseñas</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para mostrar las reseñas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reseñas</Text>
            <ScrollView style={styles.modalReviewsContainer}>
              {reseñas.length > 0 ? (
                reseñas.map((reseña) => (
                  <View key={reseña.id} style={styles.review}>
                    <Text style={styles.bold}>{reseña.usuario}</Text>
                    <Text>{reseña.comentario}</Text>
                    <Text style={styles.date}>
                      {new Date(reseña.fecha.seconds * 1000).toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviews}>No hay reseñas aún.</Text>
              )}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loadReviewsButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  loadReviewsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalReviewsContainer: {
    width: '100%',
    maxHeight: 300,
  },
  review: {
    marginBottom: 15,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  noReviews: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

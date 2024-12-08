import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import app from '../utils/firebase';

const db = getFirestore(app);

export default function ModifcarLugar({ route, navigation }) {
  const { lugar } = route.params;

  const [nombre, setNombre] = useState(lugar.nombre);
  const [descripcion, setDescripcion] = useState(lugar.descripcion);
  const [horarios, setHorarios] = useState(lugar.horarios);

  const handleUpdate = async () => {
    try {
      const lugarRef = doc(db, "lugares", lugar.id);
      await updateDoc(lugarRef, {
        nombre,
        descripcion,
        horarios,
      });
      Alert.alert("Lugar actualizado con éxito");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar lugar: ", error);
      Alert.alert("Error al actualizar lugar");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        style={[styles.input, styles.textArea]}
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

      <Button title="Guardar Cambios" onPress={handleUpdate} color="#00796b" />
    </ScrollView>
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
    backgroundColor: '#fff', // Fondo blanco para los inputs
  },
  textArea: {
    height: 120, // Aumentamos la altura para la descripcion
    textAlignVertical: 'top', // texto en la parte superior
  },
});

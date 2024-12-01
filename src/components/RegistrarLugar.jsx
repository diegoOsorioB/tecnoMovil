import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import * as Location from 'expo-location';
import app from '../utils/firebase'; // Ajusta la ruta si tu configuración está en otro lugar

const db = getFirestore(app);

export default function RegistrarLugar({ route }) {
  const { location: initialLocation } = route.params || {};
  const [nombre, setNombre] = useState('');
  const [horarios, setHorarios] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [loadingLocation, setLoadingLocation] = useState(!initialLocation);



  const registrarLugar = async () => {
    if (!nombre || !horarios || !descripcion || !location) {
      Alert.alert("Error", "Por favor completa todos los campos y asegúrate de que haya una ubicación disponible.");
      return;
    }

    try {
      await addDoc(collection(db, "lugares"), {
        nombre,
        horarios,
        descripcion,
        coordenadas: {
          latitud: location.latitude,
          longitud: location.longitude,
        },
        fechaRegistro: new Date(),
      });
      Alert.alert("Éxito", "Lugar registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar el lugar:", error);
      Alert.alert("Error", "Hubo un problema al registrar el lugar.");
    }
  };

  if (loadingLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>  
      <Text style={styles.text}>Nombre del puesto</Text>
      <TextInput
        style={styles.inputtext}
        value={nombre}
        onChangeText={setNombre}
      />
      <Text style={styles.text}>Horarios</Text>
      <TextInput
        style={styles.inputtext}
        value={horarios}
        onChangeText={setHorarios}
      />
      <Text style={styles.text}>Descripción</Text>
      <TextInput
        style={styles.inputtext}
        value={descripcion}
        onChangeText={setDescripcion}
      />
      
      <TouchableOpacity onPress={registrarLugar}>
        <Text style={styles.boton}>Registrar este lugar</Text>
      </TouchableOpacity>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  inputtext: {
    height: 40,
    width: '70%',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  boton: {
    backgroundColor: "#3cf",
    fontSize: 20,
    marginTop: 30,
    borderWidth: 1,
    paddingLeft:20,
    textAlign: 'center',
    height: 40,
    lineHeight: 35, 
    borderRadius: 15,
  },
});

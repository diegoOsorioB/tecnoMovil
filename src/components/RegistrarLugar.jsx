import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importa autenticación
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // Para subir a Imgur
import app from '../utils/firebase'; // Ajusta la ruta según tu configuración

const db = getFirestore(app);
const auth = getAuth(app); // Inicializa la autenticación

export default function RegistrarLugar({ route }) {
  const { location: initialLocation } = route.params || {};
  const [nombre, setNombre] = useState('');
  const [horarios, setHorarios] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [loadingLocation, setLoadingLocation] = useState(!initialLocation);
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false); // Para indicar si se está cargando la imagen

  useEffect(() => {
    if (!initialLocation) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error', 'Permiso para acceder a la ubicación denegado.');
          setLoadingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        setLoadingLocation(false);
      })();
    } else {
      setLoadingLocation(false);
    }
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Error", "Se necesita acceso a la galería.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  const uploadImageToImgur = async (imageUri) => {
    const clientId = '75c914ce9afcc6a'; // Sustituye con tu Client ID de Imgur
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });

    try {
      setUploading(true);
      const response = await axios.post('https://api.imgur.com/3/image', formData, {
        headers: {
          Authorization: `Client-ID ${clientId}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploading(false);
      return response.data.data.link; // Devuelve la URL de la imagen subida
    } catch (error) {
      setUploading(false);
      console.error("Error al subir imagen a Imgur:", error);
      Alert.alert("Error", "No se pudo cargar la imagen.");
      throw error;
    }
  };

  const registrarLugar = async () => {
    if (!nombre || !horarios || !descripcion || !location || !imageUri) {
      Alert.alert(
        "Error",
        "Por favor completa todos los campos, selecciona una imagen y asegúrate de que haya una ubicación disponible."
      );
      return;
    }

    const currentUser = auth.currentUser; // Obtén el usuario autenticado
    if (!currentUser) {
      Alert.alert("Error", "No se pudo autenticar al usuario.");
      return;
    }

    try {
      const imageUrl = await uploadImageToImgur(imageUri); // Sube la imagen y obtén la URL
      await addDoc(collection(db, "lugares"), {
        nombre,
        horarios,
        descripcion,
        coordenadas: {
          latitud: location.latitude,
          longitud: location.longitude,
        },
        imagen: imageUrl, // Guarda la URL pública en Firestore
        uid_usuario: currentUser.uid, // Agrega el UID del usuario
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
      <View style={styles.profileImageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagen} />
        ) : (
          <Text>No se ha seleccionado una imagen</Text>
        )}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Nombre del lugar</Text>
        <TextInput
          style={styles.inputtext}
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Horarios</Text>
        <TextInput
          style={styles.inputtext}
          value={horarios}
          onChangeText={setHorarios}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Descripción</Text>
        <TextInput
          style={styles.inputtext}
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity onPress={registrarLugar} style={styles.boton}>
          <Text style={styles.botonText}>Registrar este lugar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagen: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageButton: {
    backgroundColor: '#3cf',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
    width: '80%',
  },
  inputtext: {
    height: 45,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  boton: {
    backgroundColor: '#3cf',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonText: {
    color: 'white',
    fontSize: 18,
  },
});

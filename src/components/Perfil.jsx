import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function Perfil({ logout, user }) {
  const [profileData, setProfileData] = useState({
    name: user.displayName || '',
    phone: user.phoneNumber || '',
    email: user.email,
    password: user.password || '',
    repeatPassword: user.password || '',
  });

  const [profileImage, setProfileImage] = useState(user.photoURL || 'URL_DE_IMAGEN_PREDETERMINADA');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permiso para acceder a la galería denegado');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setProfileImage(pickerResult.assets[0].uri);
    }
  };

  const [formErrors, setFormErrors] = useState({});

  const update = async () => {
    let errors = {};

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const updates = {};

        if (profileData.name !== currentUser.displayName) {
          updates.displayName = profileData.name;
        }

        if (profileImage && profileImage !== currentUser.photoURL) {
          updates.photoURL = profileImage;
        }

        if (Object.keys(updates).length > 0) {
          await updateProfile(currentUser, updates);
        }

        if (profileData.email !== currentUser.email) {
          await updateEmail(currentUser, profileData.email);
        }

        if (profileData.password && profileData.password.length >= 6) {
          if (profileData.password !== profileData.repeatPassword) {
            errors.password = true;
            errors.repeatPassword = true;
          } else {
            await updatePassword(currentUser, profileData.password);
          }
        }

        console.log('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.log('Error al actualizar el perfil:', error);
      if (error.code === 'auth/email-already-in-use') {
        errors.email = true;
      } else if (error.code === 'auth/weak-password') {
        errors.password = true;
      }
    }

    setFormErrors(errors);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Cierre de Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>No hay imagen de perfil</Text>
        )}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Cambiar Imagen</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nombre</Text>
      
      <TextInput
        style={styles.input}
        value={profileData.name}
        onChange={(e) => setProfileData({ ...profileData, name: e.nativeEvent.text })}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={profileData.email}
        onChange={(e) => setProfileData({ ...profileData, email: e.nativeEvent.text })}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={profileData.password}
        secureTextEntry
        onChange={(e) => setProfileData({ ...profileData, password: e.nativeEvent.text })}
      />

      <Text style={styles.label}>Repetir Contraseña</Text>
      <TextInput
        style={styles.input}
        value={profileData.repeatPassword}
        secureTextEntry
        onChange={(e) => setProfileData({ ...profileData, repeatPassword: e.nativeEvent.text })}
      />

      <TouchableOpacity onPress={update} style={styles.button}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#3cf',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 8,
    width: '80%',
  },
  input: {
    height: 45,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#3cf',
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

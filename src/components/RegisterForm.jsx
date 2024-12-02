import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker'; // Importa Picker
import app from '../utils/firebase';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { validateEmail } from '../utils/validation';
import { getFirestore, doc, setDoc } from 'firebase/firestore'

export default function RegisterForm({ changeForm }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    repeatPassword: '',
    role: 'Emprendedor',
  });

  const [formErrors, setFormErrors] = useState({});

  const register = () => {
    let errors = {};
    if (!formData.email || !formData.password || !formData.repeatPassword || !formData.displayName) {
      console.log('Algun campo está vacío');
      if (!formData.email) errors.email = true;
      if (!formData.password) errors.password = true;
      if (!formData.repeatPassword) errors.repeatPassword = true;
      if (!formData.displayName) errors.displayName = true;
    } else if (!validateEmail(formData.email)) {
      errors.email = true;
    } else if (formData.password !== formData.repeatPassword) {
      errors.password = true;
      errors.repeatPassword = true;
    } else if (formData.password.length < 6) {
      errors.password = true;
      errors.repeatPassword = true;
    } else {
      const auth = getAuth(app);
      const db = getFirestore(app);
      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;

          // Actualiza el nombre del usuario después de la creación
          updateProfile(user, { displayName: formData.displayName })
            .then(() => {
              console.log("Nombre de usuario actualizado correctamente.");
            })
            .catch((error) => {
              console.error("Error al actualizar el nombre:", error);
            });

          // Guardar el rol en Firestore
          setDoc(doc(db, "users", user.uid), {
            email: formData.email,
            role: formData.role,
          }).then(() => {
            console.log("Rol del usuario guardado correctamente.");
          }).catch((error) => {
            console.error("Error al guardar el rol:", error);
          });

          console.log('Usuario creado con rol:', formData.role);
          console.log(user);
        })
        .catch((error) => {
          console.error(error.code, error.message);
        });
    }
    setFormErrors(errors);
    console.log(errors);
  };

  return (
    <>
      <TextInput
        style={[styles.input, formErrors.displayName && styles.error]}
        placeholder="Nombre"
        placeholderTextColor="#969696"
        onChange={(e) => setFormData({ ...formData, displayName: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.email && styles.error]}
        placeholder="Correo electrónico"
        placeholderTextColor="#969696"
        onChange={(e) => setFormData({ ...formData, email: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.password && styles.error]}
        placeholder="Contraseña"
        placeholderTextColor="#969696"
        secureTextEntry
        onChange={(e) => setFormData({ ...formData, password: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.repeatPassword && styles.error]}
        placeholder="Repetir Contraseña"
        placeholderTextColor="#969696"
        secureTextEntry
        onChange={(e) => setFormData({ ...formData, repeatPassword: e.nativeEvent.text })}
      />
        
      <Picker
        selectedValue={formData.role}
        onValueChange={(value) => setFormData({ ...formData, role: value })}
        style={styles.picker}
      >
        <Picker.Item label="Emprendedor" value="Emprendedor" />
        <Picker.Item label="Usuario" value="Usuario" />
      </Picker>
      
      <TouchableOpacity onPress={register}>
        <Text style={styles.button}>Registrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={changeForm}>
        <Text style={styles.button}>Iniciar sesión</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3cf",
    fontSize: 20,
    marginTop: 30,
    borderWidth: 1,
    width: 180,
    textAlign: 'center',
    height: 35,
    borderRadius: 15,
    lineHeight: 35,
  },
  input: {
    height: 50,
    width: '80%',
    color: '#000',
    backgroundColor: '#a3f3df',
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  pickerContainer: {
    marginBottom: 25,
    width:80,
    borderRadius:50
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#a3f3df',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 25,
  },
  error: {
    borderColor: '#f00',
    borderWidth: 2,
  },
});

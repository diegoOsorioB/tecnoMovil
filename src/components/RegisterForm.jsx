import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import app from '../utils/firebase';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { validateEmail } from '../utils/validation';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

          
          updateProfile(user, { displayName: formData.displayName })
            .then(() => {
              console.log("Nombre de usuario actualizado correctamente.");
            })
            .catch((error) => {
              console.error("Error al actualizar el nombre:", error);
            });

          
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
        placeholderTextColor="#9ca3af"
        onChange={(e) => setFormData({ ...formData, displayName: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.email && styles.error]}
        placeholder="Correo electrónico"
        placeholderTextColor="#9ca3af"
        onChange={(e) => setFormData({ ...formData, email: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.password && styles.error]}
        placeholder="Contraseña"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        onChange={(e) => setFormData({ ...formData, password: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.repeatPassword && styles.error]}
        placeholder="Repetir Contraseña"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        onChange={(e) => setFormData({ ...formData, repeatPassword: e.nativeEvent.text })}
      />
        
      <Picker
        selectedValue={formData.role}
        onValueChange={(value) => setFormData({ ...formData, role: value })}
        style={[styles.picker, formErrors.role && styles.error]}
      >
        <Picker.Item label="Emprendedor" value="Emprendedor" />
        <Picker.Item label="Usuario" value="Usuario" />
      </Picker>
      
      <TouchableOpacity onPress={register} style={styles.buttonPrimary}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={changeForm} style={styles.buttonSecondary}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    width: '80%',
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: '#ec4899',
    width: '80%',
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 50,
    width: '80%',
    color: '#374151',
    backgroundColor: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  picker: {
    height: 60,
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  error: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
});

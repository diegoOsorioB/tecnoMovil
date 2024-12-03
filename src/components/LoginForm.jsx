import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import app from '../utils/firebase';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { validateEmail } from '../utils/validation';

export default function RegisterForm({ changeForm }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeatPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const register = () => {
    let errors = {};
    if (!formData.email || !formData.password) {
      console.log('Algún campo está vacío');
      if (!formData.email) errors.email = true;
      if (!formData.password) errors.password = true;
    } else if (!validateEmail(formData.email)) {
      errors.email = true;
    } else if (formData.password.length < 6) {
      errors.password = true;
      errors.repeatPassword = true;
    } else {
      const auth = getAuth(app);
      signInWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(`Error [${errorCode}]: ${errorMessage}`);
        });
      console.log(formData);
    }
    setFormErrors(errors);
    console.log(errors);
  };

  return (
    <>
      <TextInput
        style={[styles.input, formErrors.email && styles.error]}
        placeholder="Correo electrónico"
        placeholderTextColor="#9ca3af" // Gris tenue
        onChange={e => setFormData({ ...formData, email: e.nativeEvent.text })}
      />
      <TextInput
        style={[styles.input, formErrors.password && styles.error]}
        placeholder="Contraseña"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        onChange={e => setFormData({ ...formData, password: e.nativeEvent.text })}
      />
      <TouchableOpacity onPress={register}>
        <Text style={styles.boton}>Iniciar sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={changeForm}>
        <Text style={styles.botonSecondary}>Registrarse</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: "#3b82f6", // Azul vibrante
    color: "#ffffff",
    fontSize: 18,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#2563eb",
    width: 200,
    textAlign: "center",
    height: 45,
    lineHeight: 45,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: "center",
  },
  botonSecondary: {
    backgroundColor: "#ec4899", // Rosa fuerte
    color: "#ffffff",
    fontSize: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#db2777",
    width: 200,
    textAlign: "center",
    height: 45,
    lineHeight: 45,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: "center",
  },
  input: {
    height: 50,
    width: "90%",
    color: "#374151", // Gris oscuro
    backgroundColor: "#f3f4f6", // Gris claro
    justifyContent: "flex-end",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db", // Gris intermedio
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  error: {
    borderColor: "#ef4444", // Rojo intenso
    borderWidth: 2,
  },
});

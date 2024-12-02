import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker'; // Importa Picker
import app from '../utils/firebase';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { validateEmail } from '../utils/validation';

export default function RegisterForm({ changeForm }) {
  const [formData, setFormData] = useState({
    name:'',
    email: '',
    password: '',
    repeatPassword: '',
    role: 'Cliente',
  });

  const [formErrors, setFormErrors] = useState({});

  const register = () => {
    let errors = {};
    if (!formData.email || !formData.password || !formData.repeatPassword || !formData.name) {
      console.log('Algun campo está vacío');
      if (!formData.email) errors.email = true;
      if (!formData.password) errors.password = true;
      if (!formData.repeatPassword) errors.repeatPassword = true;
      if (!formData.name) errors.name = true;
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
      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('Usuario creado con rol:', formData.role);
          console.log(user);
        })
        .catch((error) => {
          console.error(error.code, error.message);
        });
      console.log(formData);
    }
    setFormErrors(errors);
    console.log(errors);
  };

  return (
    <>
      <TextInput
        style={[styles.input, formErrors.name && styles.error]}
        placeholder="Nombre"
        placeholderTextColor="#969696"
        onChange={(e) => setFormData({ ...formData, name: e.nativeEvent.text })}
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
          <Picker.Item label="Cliente" value="Cliente" />
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

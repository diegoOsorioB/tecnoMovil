import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import app from '../utils/firebase'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { validateEmail } from '../utils/validation'

export default function RegisterForm({changeForm}) {
  
const [formData, setFormData] = useState({
  email:'',
  password:'',
  repeatPassword:''
})

const [fromErrors, setFromErrors] = useState({})




  const register = () =>{
    let errors = {}
   if (!formData.email || !formData.password) {
    console.log('Algun campo esta vacio')
    if (!formData.email) errors.email = true
    if (!formData.email) errors.password = true
   }else if(!validateEmail(formData.email)){
    errors.email = true 
   }else if(formData.password.length<6) {
    errors.password = true
    errors.repeatPassword = true
   }else{


    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    console.log(formData)
   }
   setFromErrors(errors)
   console.log(errors)
  }
  return (
    <>
      <TextInput 
        style={[styles.input,fromErrors.email && styles.error]}
        placeholder='Correo electronico'
        placeholderTextColor='#969696'
        onChange={e=>setFormData({...formData,email: e.nativeEvent.text})}
      ></TextInput>
      <TextInput 
        style={[styles.input,fromErrors.password && styles.error]}
        placeholder='Contraseña'
        placeholderTextColor='#969696'
        secureTextEntry
        onChange={e=>setFormData({...formData,password: e.nativeEvent.text})}
      ></TextInput>

      <TouchableOpacity onPress={register}>
        <Text style={styles.boton}>Iniciar sesion </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={changeForm}>
      <Text style={styles.boton}>Registrarse </Text>
      </TouchableOpacity>
     
      
    </>
  )
}

const styles = StyleSheet.create({
    boton:{
        backgroundColor:"#3cf",
        fontSize:20,
        marginTop:30,
        borderWidth:1,
        width:180,
        textAlign:'center',
        height:35,
        borderRadius:15
    },
    input:{
        height:50,
        width:'80%',
        color:'#fff',
        backgroundColor:'#a3f3df',
        justifyContent:'flex-end',
        fontSize:18,
        borderWidth:1,
        borderRadius:30,
        paddingHorizontal:20,
        marginBottom:25
    },
    register:{
      flex:1,
      marginBottom:10,

    },
    error:{
      borderColor:'#f00',
      borderWidth:4,
    }
})
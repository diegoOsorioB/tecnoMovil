import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image} from 'react-native'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { validateEmail } from '../utils/validation'
import { getAuth, updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function Perfil({logout,user}) {

  const [profileData, setProfileData] = useState({
    name:user.displayName || '',
    phone:user.phoneNumber || '',
    email:user.email,
    password:user.password||'',
    repeatPassword:user.password||''
  })

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
      console.log('Imagen seleccionada:', pickerResult.assets[0].uri); 
      setProfileImage(pickerResult.assets[0].uri);  
    }
  };
  

  const [fromErrors, setFromErrors] = useState({})

  const update = async () => {
    let errors = {};

    if (!profileData.email || !profileData.phone || !profileData.name) {
      console.log('Algun campo esta vacio');
      if (!profileData.name) errors.name = true;
      if (!profileData.password) errors.password = true;
      if (!profileData.repeatPassword) errors.repeatPassword = true;
      if (!profileData.phone) errors.phone = true;
    } else if (!validateEmail(profileData.email)) {
      errors.email = true;
    } else if (profileData.password !== profileData.repeatPassword) {
      errors.password = true;
      errors.repeatPassword = true;
    } else if (profileData.password.length < 6) {
      errors.password = true;
      errors.repeatPassword = true;
    } else {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          if (profileImage) {
            setProfileImage(user.photoURL);
            await updateProfile(user, { displayName: profileData.name, photoURL: profileImage });
            console.log(profileImage)
          } else {
            await updateProfile(user, { displayName: profileData.name });
          }


          if (profileData.email !== user.email) {
            await updateEmail(user, profileData.email);
          }

          if (profileData.password) {
            await updatePassword(user, profileData.password);
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
    }
    setFromErrors(errors);
    console.log(errors);
  }

  return (
   <View style={styles.container}>
    <View style={styles.profileImageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.imagen} />
        ) : (
          <Text>No hay imagen de perfil</Text>
        )}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Cambiar Imagen</Text>
        </TouchableOpacity>
      </View>
    <Text  style={styles.text}>Nombre</Text>
    <TextInput
    style={styles.inputtext}
    value={profileData.name}
    onChange={e => setProfileData({...profileData,name:e.nativeEvent.text})}
    />
    <Text style={styles.text}>Telefono</Text>
    <TextInput
    style={styles.inputtext}
    value={profileData.phone}
    keyboardType="phone-pad"
    onChange={e => setProfileData({...profileData,phone:e.nativeEvent.text})}
    />
    <Text style={styles.text}>E-mail</Text>
    <TextInput
    style={styles.inputtext}
    value={profileData.email}
    onChange={e => setProfileData({...profileData,email:e.nativeEvent.text})}
    />
    <Text style={styles.text}>Contraseña</Text>
    <TextInput
    style={styles.inputtext}
    value={profileData.password}
    secureTextEntry
    onChange={e => setProfileData({...profileData,password:e.nativeEvent.text})}
    />
    <Text style={styles.text}>Repetir contraseña</Text>
    <TextInput
    style={styles.inputtext}
    value={profileData.repeatPassword}
    secureTextEntry
    onChange={e => setProfileData({...profileData,repeatPassword:e.nativeEvent.text})}
    />
    <TouchableOpacity onPress={update}>
      <Text style={styles.boton}>Guardar Cambios</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={logout}>
      <Text style={styles.boton}>Cerrar Sesion</Text>
    </TouchableOpacity>
    </View>

  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems: 'center',
    padding:5
  },
  inputtext:{
    height:40,
    width:'80%',
    borderWidth:1,
    paddingLeft:10
  },
  imageButton: {
    backgroundColor: '#3cf',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  text:{
    fontSize: 16,
    marginVertical: 5,
  } ,
  boton: {
    backgroundColor: "#3cf",
    fontSize: 20,
    marginTop: 30,
    borderWidth: 1,
    width: 180,
    textAlign: 'center',
    height: 35,
    borderRadius: 15
  },
})
import { StyleSheet, Text, View,Image,Button } from 'react-native'
import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function Auth() {

    const [islogin, setIslogin] = useState(false)

    const changeForm = () =>{
        setIslogin(!islogin)
    }

  return (
    <View style={styles.view}>
        {islogin ? 
        <Image style={styles.logo} source={require('../../assets/icon.png')} /> :
        <Image style={styles.logo2} source={require('../../assets/icon.png')} />}
        {islogin ? <LoginForm changeForm={changeForm}/> : <RegisterForm changeForm={changeForm}/>}
    </View>
  )
}

const styles = StyleSheet.create({
    logo:{
        width:'80%',
        height: 250,
        marginTop:50,
        marginBottom: 50
    },
    logo2:{
      width:'80%',
      height: 150,
      marginTop:50,
      marginBottom: 50
  },
    view:{
      flex:1,
      alignItems:'center'
        
    }
})
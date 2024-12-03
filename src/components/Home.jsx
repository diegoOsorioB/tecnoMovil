import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Perfil from './Perfil';


const Tab = createBottomTabNavigator();

// Pantallas
function AltasScreen() {
  return (
    <View style={styles.container}>
      <Perfil/>
    </View>
  );
}

function BuscarScreen() {
  return (
    <View style={styles.container}>
      <DeleteForm/>
    </View>
  );
}

function ModificarScreen() {
  return (
    <View style={styles.container}>
      <UpdateForm/>
    </View>
  );
}

function ReporteScreen() {
  return (
    <View style={styles.container}>
      <ReportForm/>
    </View>
  );
}

export default function Home() {
  return (
    <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Asignar iconos según la ruta
          if (route.name === 'Altas') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'Eliminar') {
            iconName = focused ? 'trash' : 'trash-outline';
          } else if (route.name === 'Modificar') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Reporte') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          // Devolver ícono
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Altas" component={AltasScreen} />
      <Tab.Screen name="Eliminar" component={BuscarScreen} />
      <Tab.Screen name="Modificar" component={ModificarScreen} />
      <Tab.Screen name="Reporte" component={ReporteScreen} />
    </Tab.Navigator>
  </NavigationContainer>
  )
}

const styles = StyleSheet.create({})
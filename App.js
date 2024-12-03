import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from './src/utils/firebase';
import Auth from './src/components/Auth';
import Perfil from './src/components/Perfil'
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Mapa from './src/components/Mapa';
import { createStackNavigator } from '@react-navigation/stack';
import RegistrarLugar from './src/components/RegistrarLugar';
import MapaUsuario from './src/components/MapaUsuario';
import Reseñas from './src/components/Reseñas';
import MostrarLugares from './src/components/ModificarLugares';


export default function App() {
  const [user, setUser] = useState(undefined); // Estado de autenticación

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...user, role: userData.role }); // Guardar rol en el estado
          } else {
            console.error("Documento de usuario no encontrado");
          }
        } catch (error) {
          console.error("Error al obtener rol del usuario:", error);
        }
      } else {
        setUser(false);
      }
    });
  
    return unsubscribe; // Limpieza del listener
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00f" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? <LoggedInTabs user={user} /> : <Auth />}
    </View>
  );
}

// Componente de Tabs cuando el usuario está autenticado
function LoggedInTabs({ user }) {
  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();
  // Función para cerrar sesión
  const logout = () => {
    const auth = getAuth(app);
    signOut(auth)
      .then(() => console.log('Sesión cerrada'))
      .catch((error) => console.error('Error al cerrar sesión:', error));
  };

  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                switch (route.name) {
                  case 'Altas':
                    iconName = focused ? 'person-add' : 'person-add-outline';
                    break;
                  case 'Eliminar':
                    iconName = focused ? 'trash' : 'trash-outline';
                    break;
                  case 'Info':
                    iconName = focused ? 'create' : 'create-outline';
                    break;
                  case 'Perfil':
                    iconName = focused
                      ? 'person-circle'
                      : 'person-circle-outline';
                    break;
                  default:
                    iconName = 'help-circle-outline';
                }
                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'gray',
            })}
          >
            <Tab.Screen name="Altas" component={AltasScreen} initialParams={{user}} />
            {
              user?.role==='Cliente'?<Tab.Screen name="Info" component={ModificarScreen}/>:
              null
            }
            <Tab.Screen
              name="Perfil"
              children={() => <PerfilScreen logout={logout} user={user} />}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="RegistrarLugar"
        component={RegistrarLugar}
        options={{ title: 'Registro de Lugar' }}
      />
      <Stack.Screen
        name="Reseñas"
        component={Reseñas}
        options={{ title: 'Reseñas' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

// Componentes de cada pantalla
function AltasScreen({ navigation, route }) {
  const { user } = route.params; // Recibe el usuario como parámetro
console.log('EL rol es ',user.role)
  return user?.role === 'Emprendedor' ? (
    <Mapa navigation={navigation}/>
  ) : (
    <MapaUsuario navigation={navigation} />
  );
}

function EliminarScreen() {
  return (
    <View style={styles3.container}>
      <Text>Pantalla de Eliminar</Text>
    </View>
  );
}

function ModificarScreen({ user }) {
  return (
  <MostrarLugares/>
  );
}

function PerfilScreen({ logout, user }) {
  return (
    <>
      <Perfil logout={logout} user={user} />
    </>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
});

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});

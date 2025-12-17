import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppBar from './screens/Appbar';
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import AppStack from "./screens/navigation/AppStack";
import AppDrawer from "./screens/navigation/AppDrawer";
import AuthProvider, { AuthContext } from "./screens/context/AuthContext";



// --- Création des navigateurs ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
function DetailsScreen({ route }) {
return (
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
<Text>📄 Écran de détails</Text>
{route.params && <Text>ID reçu : {route.params.id}</Text>}
</View>
);
}
function SettingsScreen() {
return (
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
<Text>⚙ Paramètres</Text>
</View>
);
}
// --- Navigation par pile ---
function HomeStack() {
return (
<Stack.Navigator  screenOptions={{ headerShown: false }}>
<Stack.Screen name="Accueil" component={HomeScreen} options={{
headerStyle: { backgroundColor: '#007AFF' }, headerTintColor: '#fff', headerTitleStyle: {
fontWeight: 'bold' },
}}
/>
<Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Mes Détails Personnalisés' }}
/>
</Stack.Navigator>
);
}
// --- Navigation par onglets ---
function MainTabs() {
  return (
    <>
      <AppBar />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#f0f0f0' },
          tabBarLabelStyle: { fontSize: 14 },
        }}
      >
        <Tab.Screen
          name="Maison"
          component={HomeStack}
          options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />), }}
        />
        <Tab.Screen
          name="Tâches"
          component={AppStack}
          options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />), }}
        />
        <Tab.Screen
          name="Paramètres"
          component={SettingsScreen}
          options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="settings" size={size} color={color} />), }}
        />
      </Tab.Navigator>
    </>
  );
}

function RootNavigator() {
  const { user } = useContext(AuthContext) || {};
  return user ? <AppDrawer /> : <LoginScreen />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}

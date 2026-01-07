import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppDrawer from "./AppDrawer";
import TaskFormScreen from "../screens/TaskFormScreen";
import TodoDetailsScreen from "../screens/TodoDetailsScreen";
import CategoryManagerScreen from "../screens/CategoryManagerScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="App" component={AppDrawer} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="TodoDetails" component={TodoDetailsScreen} />
            <Stack.Screen name="CategoryManager" component={CategoryManagerScreen} options={{ headerShown: true, title: 'Catégories' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
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
import SettingsScreen from "../screens/SettingsScreen";
import SuggestionsScreen from "../screens/SuggestionsScreen";
import ReminderScreen from "../screens/ReminderScreen";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Préférences' }} />
            <Stack.Screen name="Suggestions" component={SuggestionsScreen} options={{ headerShown: true, title: 'Idées & Suggestions' }} />
            <Stack.Screen name="Reminders" component={ReminderScreen} options={{ headerShown: true, title: 'Rappels' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
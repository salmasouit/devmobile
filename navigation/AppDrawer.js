import { createDrawerNavigator } from "@react-navigation/drawer";
import TodoListScreen from "../screens/TodoListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CategoryManagerScreen from "../screens/CategoryManagerScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SuggestionsScreen from "../screens/SuggestionsScreen";
import ReminderScreen from "../screens/ReminderScreen";
import { Ionicons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="Suggestions"
        component={SuggestionsScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="bulb-outline" size={22} color={color} />,
          title: "Idées & Suggestions"
        }}
      />
      <Drawer.Screen
        name="Mes tâches"
        component={TodoListScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen
        name="Rappels"
        component={ReminderScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="notifications-outline" size={22} color={color} />,
          title: "Mes Rappels"
        }}
      />
      <Drawer.Screen
        name="Catégories"
        component={CategoryManagerScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="apps-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen
        name="Préférences"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />
        }}
      />
    </Drawer.Navigator>
  );
}

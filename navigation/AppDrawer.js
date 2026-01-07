import { createDrawerNavigator } from "@react-navigation/drawer";
import TodoListScreen from "../screens/TodoListScreen";
import ProfileScreen from "../screens/ProfileScreen";

import CategoryManagerScreen from "../screens/CategoryManagerScreen";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Mes tâches" component={TodoListScreen} />
      <Drawer.Screen name="Catégories" component={CategoryManagerScreen} />
      <Drawer.Screen name="Profil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
